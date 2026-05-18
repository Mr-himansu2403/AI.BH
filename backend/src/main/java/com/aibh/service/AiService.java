package com.aibh.service;

import com.aibh.model.ChatMessage;
import com.aibh.model.Intent;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AiService {
    
    private static final Logger logger = LoggerFactory.getLogger(AiService.class);
    
    @Value("${app.ai.provider:openai}")
    private String aiProvider;

    @Value("#{'${app.ai.providers:}'.trim().isEmpty() ? T(java.util.Collections).emptyList() : '${app.ai.providers:}'.split(',')}")
    private List<String> configuredProviders;

    @Value("${app.ai.gemini.api-key:${GEMINI_API_KEY:}}")
    private String geminiApiKey;

    @Value("${app.ai.gemini.base-url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiBaseUrl;

    @Value("${app.ai.gemini.model:${GEMINI_MODEL:gemini-2.0-flash}}")
    private String geminiDefaultModel;
    
    @Value("${spring.ai.anthropic.api-key:${ANTHROPIC_API_KEY:}}")
    private String anthropicApiKey;

    @Value("${spring.ai.anthropic.base-url:https://api.anthropic.com/v1/messages}")
    private String anthropicBaseUrl;

    @Value("${spring.ai.vectorstore.simple.file-path:data/vectorstore.json}")
    private String vectorStorePath;

    @Autowired(required = false)
    @org.springframework.beans.factory.annotation.Qualifier("openAiChatClient")
    private ChatClient openAiChatClient;

    @Autowired(required = false)
    @org.springframework.beans.factory.annotation.Qualifier("ollamaChatClient")
    private ChatClient ollamaChatClient;

    @Autowired
    private ObjectMapper objectMapper;

    private final RestTemplate restTemplate = new RestTemplate();
    
    @Autowired(required = false)
    private org.springframework.ai.vectorstore.VectorStore vectorStore;
    
    @Autowired(required = false)
    private IntentDetectionService intentDetectionService;
    
    @Autowired(required = false)
    private ModelRoutingService modelRoutingService;
    
    private static final String SYSTEM_PROMPT = 
        "You are AI.BH, a professional-grade AI assistant. Your goal is to provide DIRECT, ACCURATE, and filler-free answers.\n\n" +
        "CORE DIRECTIVES:\n" +
        "1. Start with the answer immediately. No 'Sure, I can help' or 'Based on the context'.\n" +
        "2. Be concise but technically deep when needed.\n" +
        "3. Use professional, clear language.\n" +
        "4. For code, provide only the working solution with minimal comments.\n" +
        "5. If the answer depends on missing company, project, or domain-specific knowledge, say exactly what information or documents are needed.\n" +
        "6. If training, documentation upload, or retrieval setup would improve accuracy, say so explicitly in one short sentence.\n" +
        "7. When writing UI components, HTML, SVG, or interactive scripts, output the full, deployable code inside a standard markdown code block (e.g., ```html). This automatically triggers the user's split-screen Artifact Preview Panel.\n\n" +
        "CONTEXT FROM DOCUMENTS:\n{context}";
    
    public String generateResponse(String userMessage, List<ChatMessage> conversationHistory) {
        for (String provider : getOrderedProviders()) {
            try {
                Prompt prompt = buildPrompt(userMessage, conversationHistory, provider);
                String response = generateWithProvider(provider, prompt);
                learnFromInteraction(userMessage, response);
                return response;
            } catch (Exception e) {
                logger.warn("AI provider {} failed, trying next provider", provider, e);
            }
        }

        logger.warn("No configured AI providers were able to answer the request");
        return generateIntelligentResponse(userMessage);
    }

    public Flux<String> streamResponse(String userMessage, List<ChatMessage> conversationHistory) {
        try {
            for (String provider : getOrderedProviders()) {
                try {
                    Prompt prompt = buildPrompt(userMessage, conversationHistory, provider);
                    if ("gemini".equals(provider)) {
                        String response = generateWithGemini(prompt);
                        learnFromInteraction(userMessage, response);
                        return Flux.just(response);
                    }
                    if ("anthropic".equals(provider)) {
                        String response = generateWithAnthropic(prompt);
                        learnFromInteraction(userMessage, response);
                        return Flux.just(response);
                    }

                    ChatClient chatClient = getChatClient(provider);
                    if (chatClient == null) {
                        continue;
                    }

                    if (chatClient instanceof org.springframework.ai.chat.StreamingChatClient streamingChatClient) {
                        Flux<String> stream = streamingChatClient.stream(prompt)
                                .map(response -> response.getResult().getOutput().getContent())
                                .filter(StringUtils::hasText)
                                .onErrorResume(e -> {
                                    logger.error("Streaming error from provider {}", provider, e);
                                    return Flux.just("\n[Error: AI Stream Interrupted]");
                                })
                                .share(); // Share allows multiple subscribers

                        // Continuous learning: subscribe asynchronously to capture the full response
                        stream.collectList().subscribe(chunks -> {
                            String fullResponse = String.join("", chunks);
                            learnFromInteraction(userMessage, fullResponse);
                        });

                        return stream;
                    }

                    String response = callSpringAiProvider(chatClient, prompt);
                    learnFromInteraction(userMessage, response);
                    return Flux.just(response);
                } catch (Exception e) {
                    logger.warn("Streaming AI provider {} failed, trying next provider", provider, e);
                }
            }
        } catch (Exception e) {
            logger.error("Error initiating stream", e);
        }

        logger.warn("Streaming fallback engaged because no AI provider was available");
        return Flux.just(generateIntelligentResponse(userMessage));
    }

    private Prompt buildPrompt(String userMessage, List<ChatMessage> conversationHistory, String provider) {
        String context = "No document context found.";
        if (vectorStore != null) {
            try {
                List<org.springframework.ai.document.Document> similarDocs = vectorStore.similaritySearch(userMessage);
                if (!similarDocs.isEmpty()) {
                    context = similarDocs.stream()
                        .map(org.springframework.ai.document.Document::getContent)
                        .collect(Collectors.joining("\n---\n"));
                }
            } catch (Exception e) {
                logger.warn("RAG retrieval failed, continuing without context", e);
            }
        }

        List<Message> messages = new ArrayList<>();
        messages.add(new SystemMessage(SYSTEM_PROMPT.replace("{context}", context)));
        
        if (conversationHistory != null) {
            int maxHistory = 5;
            int start = Math.max(0, conversationHistory.size() - maxHistory);
            for (int i = start; i < conversationHistory.size(); i++) {
                ChatMessage msg = conversationHistory.get(i);
                if (StringUtils.hasText(msg.getUserMessage())) messages.add(new UserMessage(msg.getUserMessage()));
                if (StringUtils.hasText(msg.getAiResponse())) messages.add(new AssistantMessage(msg.getAiResponse()));
            }
        }
        
        messages.add(new UserMessage(userMessage));

        Intent intent = intentDetectionService != null ? 
                intentDetectionService.detectIntent(userMessage) : 
                new Intent("general", 0.5, "conversational");

        return new Prompt(messages, getOptions(intent, provider));
    }

    private ChatOptions getOptions(Intent intent, String provider) {
        float temp = (float) (modelRoutingService != null ? modelRoutingService.getTemperature(intent) : 0.7);
        String normalizedProvider = provider == null ? "openai" : provider.toLowerCase();

        return switch (normalizedProvider) {
            case "ollama" -> OllamaOptions.create()
                .withModel(modelRoutingService != null ? modelRoutingService.selectModel(intent, false, "ollama") : "llama3")
                .withTemperature(temp);
            default -> OpenAiChatOptions.builder()
                .withModel(modelRoutingService != null ? modelRoutingService.selectModel(intent, false, "openai") : "gpt-4o-mini")
                .withTemperature(temp)
                .build();
        };
    }

    private List<String> getOrderedProviders() {
        Set<String> orderedProviders = new LinkedHashSet<>();

        if (StringUtils.hasText(aiProvider)) {
            orderedProviders.add(aiProvider.trim().toLowerCase());
        }

        if (configuredProviders != null) {
            configuredProviders.stream()
                    .map(String::trim)
                    .filter(StringUtils::hasText)
                    .map(String::toLowerCase)
                    .forEach(orderedProviders::add);
        }

        if (orderedProviders.isEmpty()) {
            orderedProviders.add("openai");
        }

        return new ArrayList<>(orderedProviders);
    }

    private String generateWithProvider(String provider, Prompt prompt) {
        return switch (provider) {
            case "anthropic" -> generateWithAnthropic(prompt);
            case "gemini" -> generateWithGemini(prompt);
            case "ollama", "openai" -> {
                ChatClient chatClient = getChatClient(provider);
                if (chatClient == null) {
                    throw new IllegalStateException("Provider client not available: " + provider);
                }
                yield callSpringAiProvider(chatClient, prompt);
            }
            default -> throw new IllegalArgumentException("Unsupported AI provider: " + provider);
        };
    }

    private ChatClient getChatClient(String provider) {
        return switch (provider) {
            case "ollama" -> ollamaChatClient;
            case "openai" -> openAiChatClient;
            default -> null;
        };
    }

    private String callSpringAiProvider(ChatClient chatClient, Prompt prompt) {
        ChatResponse response = chatClient.call(prompt);
        return response.getResult().getOutput().getContent();
    }
    
    private String generateWithAnthropic(Prompt prompt) {
        if (!StringUtils.hasText(anthropicApiKey)) {
            throw new IllegalStateException("Anthropic API key is not configured");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", anthropicApiKey);
        headers.set("anthropic-version", "2023-06-01");

        List<Map<String, String>> messages = new ArrayList<>();
        String systemPrompt = "";

        for (Message msg : prompt.getInstructions()) {
            if (msg instanceof SystemMessage) {
                systemPrompt += msg.getContent() + "\n";
            } else if (msg instanceof AssistantMessage) {
                messages.add(Map.of("role", "assistant", "content", msg.getContent()));
            } else {
                messages.add(Map.of("role", "user", "content", msg.getContent()));
            }
        }

        Message latestMessage = prompt.getInstructions().get(prompt.getInstructions().size() - 1);
        Intent intent = intentDetectionService != null
                ? intentDetectionService.detectIntent(latestMessage.getContent())
                : null;
        
        String model = modelRoutingService != null 
                ? modelRoutingService.selectModel(intent, false, "anthropic") 
                : "claude-3-sonnet-20240229";
                
        int maxTokens = modelRoutingService != null ? modelRoutingService.getMaxTokens(intent) : 1000;

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "max_tokens", maxTokens,
                "system", systemPrompt,
                "messages", messages
        );

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    anthropicBaseUrl,
                    HttpMethod.POST,
                    new HttpEntity<>(requestBody, headers),
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode contentNode = root.path("content").path(0).path("text");
            if (contentNode.isTextual() && StringUtils.hasText(contentNode.asText())) {
                return contentNode.asText();
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse Anthropic response", e);
        }

        throw new IllegalStateException("Anthropic returned an empty response");
    }

    private String generateWithGemini(Prompt prompt) {
        if (!StringUtils.hasText(geminiApiKey)) {
            throw new IllegalStateException("Gemini API key is not configured");
        }

        String promptText = prompt.getInstructions().stream()
                .map(this::serializeMessage)
                .collect(Collectors.joining("\n\n"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-goog-api-key", geminiApiKey);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", promptText)))
                )
        );

        ResponseEntity<String> response = restTemplate.exchange(
                geminiBaseUrl + "/" + resolveGeminiModel(prompt) + ":generateContent",
                HttpMethod.POST,
                new HttpEntity<>(requestBody, headers),
                String.class
        );

        return extractGeminiText(response.getBody());
    }

    private String resolveGeminiModel(Prompt prompt) {
        Message latestMessage = prompt.getInstructions().get(prompt.getInstructions().size() - 1);
        Intent intent = intentDetectionService != null
                ? intentDetectionService.detectIntent(latestMessage.getContent())
                : null;

        if (modelRoutingService != null) {
            return modelRoutingService.selectModel(intent, false, "gemini");
        }

        return geminiDefaultModel;
    }

    private String extractGeminiText(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (textNode.isTextual() && StringUtils.hasText(textNode.asText())) {
                return textNode.asText();
            }

            JsonNode errorNode = root.path("error").path("message");
            if (errorNode.isTextual()) {
                throw new IllegalStateException(errorNode.asText());
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse Gemini response", e);
        }

        throw new IllegalStateException("Gemini returned an empty response");
    }

    private String serializeMessage(Message message) {
        String role;
        if (message instanceof SystemMessage) {
            role = "system";
        } else if (message instanceof AssistantMessage) {
            role = "assistant";
        } else {
            role = "user";
        }

        return role + ": " + message.getContent();
    }

    public String generateImageResponse(String message, String imageUrl, List<ChatMessage> history) {
        return "Vision support is currently being updated.";
    }

    public String generateIntelligentResponse(String message) {
        if (!StringUtils.hasText(message)) {
            return "I need a clear question or task to answer.";
        }

        return "I can answer general questions, but I need working AI provider access or project documents for domain-specific answers. If this depends on your business data, upload supporting documents to improve accuracy.";
    }

    public Map<String, String> getProviderStatus() {
        Map<String, String> statuses = new java.util.LinkedHashMap<>();

        for (String provider : getOrderedProviders()) {
            statuses.put(provider, getSingleProviderStatus(provider));
        }

        return statuses;
    }

    public boolean hasAtLeastOneAvailableProvider() {
        return getProviderStatus().values().stream().anyMatch("UP"::equals);
    }

    private String getSingleProviderStatus(String provider) {
        return switch (provider) {
            case "openai" -> openAiChatClient != null && StringUtils.hasText(System.getenv("OPENAI_API_KEY")) ? "UP" : "DOWN";
            case "anthropic" -> StringUtils.hasText(anthropicApiKey) ? "UP" : "DOWN";
            case "ollama" -> ollamaChatClient != null ? "UP" : "DOWN";
            case "gemini" -> StringUtils.hasText(geminiApiKey) ? "UP" : "DOWN";
            default -> "UNKNOWN";
        };
    }

    private void learnFromInteraction(String userMessage, String aiResponse) {
        if (vectorStore != null && StringUtils.hasText(userMessage) && StringUtils.hasText(aiResponse)) {
            try {
                // Continuous Learning: Save the interaction as a deep learning vector embedding
                String memoryContent = "User said: " + userMessage + "\nAI responded: " + aiResponse;
                org.springframework.ai.document.Document memoryDoc = new org.springframework.ai.document.Document(
                        memoryContent,
                        Map.of(
                            "type", "continuous_learning_memory", 
                            "timestamp", System.currentTimeMillis(),
                            "source", "user_interaction"
                        )
                );
                vectorStore.add(List.of(memoryDoc));
                
                // Persist to disk if it's a SimpleVectorStore
                if (vectorStore instanceof org.springframework.ai.vectorstore.SimpleVectorStore simpleStore) {
                    java.io.File vectorFile = new java.io.File(vectorStorePath);
                    vectorFile.getParentFile().mkdirs(); // Ensure directory exists
                    simpleStore.save(vectorFile);
                }
                
                logger.info("Deep Learning Memory System: Automatically learned from interaction and stored in Vector Database");
            } catch (Exception e) {
                logger.error("Failed to store memory in Vector DB for continuous learning", e);
            }
        }
    }
}