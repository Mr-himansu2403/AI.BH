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
import org.springframework.web.client.HttpClientErrorException;
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

    @Value("${app.ai.provider:anthropic}")
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

    @Autowired(required = false)
    private AiToolService aiToolService;

    // ─── System Prompt ──────────────────────────────────────────────────────────
    private static final String SYSTEM_PROMPT =
        "You are AI.BH, a professional-grade AI assistant. Your goal is to provide DIRECT, ACCURATE, and filler-free answers.\n\n" +
        "CORE DIRECTIVES:\n" +
        "1. Start with the answer immediately. Never open with 'Sure, I can help', 'Great question', or 'Based on the context'.\n" +
        "2. Be concise but technically deep when needed.\n" +
        "3. Use professional, clear language.\n" +
        "4. For code, provide only the working solution with minimal but meaningful comments.\n" +
        "5. If the answer depends on missing company/project/domain-specific knowledge, say EXACTLY what information or documents are needed.\n" +
        "6. If training, documentation upload, or retrieval setup would improve accuracy, say so in one short sentence.\n" +
        "7. When writing HTML, CSS, JavaScript, SVG, or interactive scripts, output the FULL deployable code inside a standard markdown code block (e.g., ```html). This triggers the split-screen Artifact Preview Panel automatically.\n\n" +
        "RAG CONTEXT (retrieved from uploaded documents and conversation memory):\n" +
        "────────────────────────────────────────\n" +
        "{context}\n" +
        "────────────────────────────────────────\n" +
        "If the context above is relevant, prioritize it in your answer. If it is not relevant, ignore it and answer from your general knowledge.";

    // ─── Public API ─────────────────────────────────────────────────────────────

    public String generateResponse(String userMessage, List<ChatMessage> conversationHistory) {
        List<String> providers = getOrderedProviders();
        List<String> errors = new ArrayList<>();

        for (String provider : providers) {
            try {
                Prompt prompt = buildPrompt(userMessage, conversationHistory, provider);
                String response = generateWithProvider(provider, prompt);
                learnFromInteraction(userMessage, response);
                logger.info("✅ [AiService] Provider '{}' answered successfully", provider);
                return response;
            } catch (Exception e) {
                String reason = extractErrorReason(e, provider);
                errors.add(provider + ": " + reason);
                logger.warn("⚠️  [AiService] Provider '{}' failed — {}. Trying next.", provider, reason);
            }
        }

        logger.error("❌ [AiService] ALL providers failed. Errors: {}", errors);
        return generateIntelligentResponse(userMessage);
    }

    public Flux<String> streamResponse(String userMessage, List<ChatMessage> conversationHistory) {
        List<String> providers = getOrderedProviders();

        for (String provider : providers) {
            try {
                Prompt prompt = buildPrompt(userMessage, conversationHistory, provider);

                // Gemini and Anthropic: REST-based, return as single-chunk Flux
                if ("gemini".equals(provider)) {
                    String response = generateWithGemini(prompt);
                    learnFromInteraction(userMessage, response);
                    logger.info("✅ [AiService] Gemini answered successfully (stream mode)");
                    return Flux.just(response);
                }
                if ("anthropic".equals(provider)) {
                    String response = generateWithAnthropic(prompt);
                    learnFromInteraction(userMessage, response);
                    logger.info("✅ [AiService] Anthropic answered successfully (stream mode)");
                    return Flux.just(response);
                }

                // OpenAI / Ollama: native streaming via Spring AI
                ChatClient chatClient = getChatClient(provider);
                if (chatClient == null) {
                    logger.warn("⚠️  [AiService] No client found for provider '{}', skipping", provider);
                    continue;
                }

                if (chatClient instanceof org.springframework.ai.chat.StreamingChatClient streamingClient) {
                    final String providerName = provider;
                    Flux<String> stream = streamingClient.stream(prompt)
                            .map(resp -> resp.getResult().getOutput().getContent())
                            .filter(StringUtils::hasText)
                            .onErrorResume(e -> {
                                String reason = extractErrorReason(e, providerName);
                                logger.error("❌ [AiService] Streaming error from '{}': {}", providerName, reason);
                                // Do NOT expose raw stack traces — send friendly message
                                return Flux.just("\n⚠️ AI provider '" + providerName + "' encountered an error: " + reason +
                                                 "\nPlease check your API key in application-local.properties.");
                            })
                            .share();

                    // Async: capture full response for continuous learning
                    stream.collectList().subscribe(chunks -> {
                        String full = String.join("", chunks);
                        learnFromInteraction(userMessage, full);
                    });

                    logger.info("✅ [AiService] Streaming via provider '{}'", provider);
                    return stream;
                }

                // Fallback: call synchronously, wrap in Flux
                String response = callSpringAiProvider(chatClient, prompt);
                learnFromInteraction(userMessage, response);
                return Flux.just(response);

            } catch (Exception e) {
                String reason = extractErrorReason(e, provider);
                logger.warn("⚠️  [AiService] Provider '{}' failed during stream init — {}. Trying next.", provider, reason);
            }
        }

        logger.error("❌ [AiService] ALL providers failed in stream mode.");
        return Flux.just(generateIntelligentResponse(userMessage));
    }

    // ─── Prompt Builder (with RAG context injection) ────────────────────────────

    private Prompt buildPrompt(String userMessage, List<ChatMessage> conversationHistory, String provider) {
        // ── TASK 5: RAG — Similarity search against vector store ────────────────
        String context = "No document context available.";
        if (vectorStore != null) {
            try {
                List<org.springframework.ai.document.Document> similarDocs =
                        vectorStore.similaritySearch(userMessage);
                if (!similarDocs.isEmpty()) {
                    context = similarDocs.stream()
                            .limit(3) // top 3 most relevant chunks only — avoid token bloat
                            .map(org.springframework.ai.document.Document::getContent)
                            .collect(Collectors.joining("\n---\n"));
                    logger.debug("📚 [AiService] RAG: injected {} document chunks into prompt", similarDocs.size());
                }
            } catch (Exception e) {
                logger.warn("⚠️  [AiService] RAG retrieval failed — continuing without context: {}", e.getMessage());
            }
        }

        // ── Tool Use (MCP-style function calling) ────────────────────────────
        String toolResult = null;
        if (aiToolService != null) {
            toolResult = aiToolService.detectAndExecuteTool(userMessage);
            if (toolResult != null) {
                logger.info("🔧 [AiService] Tool result injected into prompt context");
                context = toolResult + (context.equals("No document context available.") ? "" : "\n\n" + context);
            }
        }

        List<Message> messages = new ArrayList<>();
        messages.add(new SystemMessage(SYSTEM_PROMPT.replace("{context}", context)));

        // Add recent conversation history (max 5 turns for context window efficiency)
        if (conversationHistory != null) {
            int start = Math.max(0, conversationHistory.size() - 5);
            for (int i = start; i < conversationHistory.size(); i++) {
                ChatMessage msg = conversationHistory.get(i);
                if (StringUtils.hasText(msg.getUserMessage()))
                    messages.add(new UserMessage(msg.getUserMessage()));
                if (StringUtils.hasText(msg.getAiResponse()))
                    messages.add(new AssistantMessage(msg.getAiResponse()));
            }
        }

        messages.add(new UserMessage(userMessage));

        Intent intent = intentDetectionService != null
                ? intentDetectionService.detectIntent(userMessage)
                : new Intent("general", 0.5, "conversational");

        return new Prompt(messages, getOptions(intent, provider));
    }

    private ChatOptions getOptions(Intent intent, String provider) {
        float temp = (float) (modelRoutingService != null ? modelRoutingService.getTemperature(intent) : 0.7);
        String normalizedProvider = provider == null ? "openai" : provider.toLowerCase();

        return switch (normalizedProvider) {
            case "ollama" -> OllamaOptions.create()
                    .withModel(modelRoutingService != null
                            ? modelRoutingService.selectModel(intent, false, "ollama")
                            : "mistral")
                    .withTemperature(temp);
            default -> OpenAiChatOptions.builder()
                    .withModel(modelRoutingService != null
                            ? modelRoutingService.selectModel(intent, false, "openai")
                            : "gpt-4o-mini")
                    .withTemperature(temp)
                    .build();
        };
    }

    // ─── Provider Chain ──────────────────────────────────────────────────────────

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
            orderedProviders.add("anthropic");
        }

        return new ArrayList<>(orderedProviders);
    }

    private String generateWithProvider(String provider, Prompt prompt) {
        return switch (provider) {
            case "anthropic" -> generateWithAnthropic(prompt);
            case "gemini"    -> generateWithGemini(prompt);
            case "ollama", "openai" -> {
                ChatClient client = getChatClient(provider);
                if (client == null)
                    throw new IllegalStateException("No client available for provider: " + provider);
                yield callSpringAiProvider(client, prompt);
            }
            default -> throw new IllegalArgumentException("Unsupported AI provider: " + provider);
        };
    }

    private ChatClient getChatClient(String provider) {
        return switch (provider) {
            case "ollama" -> ollamaChatClient;
            case "openai" -> openAiChatClient;
            default       -> null;
        };
    }

    private String callSpringAiProvider(ChatClient chatClient, Prompt prompt) {
        ChatResponse response = chatClient.call(prompt);
        return response.getResult().getOutput().getContent();
    }

    // ─── Anthropic (direct REST — Spring AI starter is commented out in pom.xml) ──

    private String generateWithAnthropic(Prompt prompt) {
        if (!StringUtils.hasText(anthropicApiKey) || anthropicApiKey.startsWith("dummy")) {
            throw new IllegalStateException("Anthropic API key is not configured or is a placeholder");
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
                ? intentDetectionService.detectIntent(latestMessage.getContent()) : null;

        String model    = modelRoutingService != null
                ? modelRoutingService.selectModel(intent, false, "anthropic")
                : "claude-3-haiku-20240307";
        int maxTokens   = modelRoutingService != null ? modelRoutingService.getMaxTokens(intent) : 800;

        Map<String, Object> requestBody = Map.of(
                "model",      model,
                "max_tokens", maxTokens,
                "system",     systemPrompt,
                "messages",   messages
        );

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    anthropicBaseUrl, HttpMethod.POST,
                    new HttpEntity<>(requestBody, headers),
                    String.class
            );
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode text = root.path("content").path(0).path("text");
            if (text.isTextual() && StringUtils.hasText(text.asText())) {
                return text.asText();
            }
            throw new IllegalStateException("Anthropic returned an empty response body");
        } catch (HttpClientErrorException e) {
            throw new IllegalStateException("Anthropic HTTP " + e.getStatusCode() + ": " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            throw new IllegalStateException("Anthropic call failed: " + e.getMessage(), e);
        }
    }

    // ─── Gemini (direct REST) ────────────────────────────────────────────────────

    private String generateWithGemini(Prompt prompt) {
        if (!StringUtils.hasText(geminiApiKey) || geminiApiKey.startsWith("your-")) {
            throw new IllegalStateException("Gemini API key is not configured — set app.ai.gemini.api-key in application-local.properties");
        }

        String promptText = prompt.getInstructions().stream()
                .map(this::serializeMessage)
                .collect(Collectors.joining("\n\n"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-goog-api-key", geminiApiKey);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", promptText))))
        );

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    geminiBaseUrl + "/" + resolveGeminiModel(prompt) + ":generateContent",
                    HttpMethod.POST,
                    new HttpEntity<>(requestBody, headers),
                    String.class
            );
            return extractGeminiText(response.getBody());
        } catch (HttpClientErrorException e) {
            throw new IllegalStateException("Gemini HTTP " + e.getStatusCode() + ": " + e.getResponseBodyAsString(), e);
        }
    }

    private String resolveGeminiModel(Prompt prompt) {
        Message latest = prompt.getInstructions().get(prompt.getInstructions().size() - 1);
        Intent intent  = intentDetectionService != null
                ? intentDetectionService.detectIntent(latest.getContent()) : null;
        return modelRoutingService != null
                ? modelRoutingService.selectModel(intent, false, "gemini")
                : geminiDefaultModel;
    }

    private String extractGeminiText(String body) {
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode text = root.path("candidates").path(0)
                    .path("content").path("parts").path(0).path("text");
            if (text.isTextual() && StringUtils.hasText(text.asText())) return text.asText();
            JsonNode err = root.path("error").path("message");
            if (err.isTextual()) throw new IllegalStateException("Gemini error: " + err.asText());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse Gemini response: " + e.getMessage(), e);
        }
        throw new IllegalStateException("Gemini returned an empty response");
    }

    private String serializeMessage(Message message) {
        String role = (message instanceof SystemMessage)  ? "system"    :
                      (message instanceof AssistantMessage) ? "assistant" : "user";
        return role + ": " + message.getContent();
    }

    // ─── Error Extraction ────────────────────────────────────────────────────────

    /**
     * Produces a short, human-readable error reason from any exception.
     * This is logged to the Spring Boot console for instant debugging.
     */
    private String extractErrorReason(Throwable e, String provider) {
        if (e instanceof HttpClientErrorException httpEx) {
            int status = httpEx.getStatusCode().value();
            String body = httpEx.getResponseBodyAsString();
            if (status == 401) return "401 Unauthorized — Invalid or expired API key for '" + provider + "'";
            if (status == 403) return "403 Forbidden — API key lacks permission for '" + provider + "'";
            if (status == 429) return "429 Rate Limited — Too many requests to '" + provider + "'";
            return "HTTP " + status + " from '" + provider + "': " + body;
        }
        if (e instanceof IllegalStateException ise) return ise.getMessage();
        return e.getClass().getSimpleName() + ": " + e.getMessage();
    }

    // ─── Vision ──────────────────────────────────────────────────────────────────

    public String generateImageResponse(String message, String imageUrl, List<ChatMessage> history) {
        if (!StringUtils.hasText(imageUrl)) {
            return generateResponse(message, history);
        }

        // Currently, only Gemini supports vision via direct REST in this implementation
        if (getOrderedProviders().contains("gemini") && StringUtils.hasText(geminiApiKey) && !geminiApiKey.startsWith("your-")) {
            try {
                return generateImageWithGemini(message, imageUrl);
            } catch (Exception e) {
                logger.warn("⚠️ [AiService] Gemini Vision failed: {}. Falling back to text-only.", e.getMessage());
            }
        }

        return "Vision support (image analysis) is coming soon for this provider. I've received your image, but I can currently only process the text: " + message;
    }

    private String generateImageWithGemini(String message, String imageUrl) {
        // Extract base64 and mime type from data URL
        // Example: data:image/jpeg;base64,/9j/4AAQSkZJRg...
        String mimeType = "image/jpeg";
        String base64Data = imageUrl;

        if (imageUrl.startsWith("data:")) {
            int commaIndex = imageUrl.indexOf(",");
            if (commaIndex != -1) {
                String header = imageUrl.substring(0, commaIndex);
                base64Data = imageUrl.substring(commaIndex + 1);
                
                if (header.contains("image/png")) mimeType = "image/png";
                else if (header.contains("image/webp")) mimeType = "image/webp";
                else if (header.contains("image/gif")) mimeType = "image/gif";
            }
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-goog-api-key", geminiApiKey);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(
                                Map.of("text", message),
                                Map.of("inline_data", Map.of(
                                        "mime_type", mimeType,
                                        "data", base64Data
                                ))
                        )
                ))
        );

        ResponseEntity<String> response = restTemplate.exchange(
                geminiBaseUrl + "/" + geminiDefaultModel + ":generateContent",
                HttpMethod.POST,
                new HttpEntity<>(requestBody, headers),
                String.class
        );

        return extractGeminiText(response.getBody());
    }

    // ─── Fallback Response ───────────────────────────────────────────────────────

    /**
     * Last-resort response when ALL AI providers fail.
     * Tells the user exactly what to do instead of a generic error.
     */
    public String generateIntelligentResponse(String message) {
        if (!StringUtils.hasText(message)) {
            return "Please type a question or task and I will answer it.";
        }

        return """
               ⚠️ **AI Provider Unavailable**

               All configured AI providers failed to respond. Here's how to fix this:

               **Option A — Use Gemini (Recommended, Free)**
               1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
               2. Open `backend/src/main/resources/application-local.properties`
               3. Set: `app.ai.gemini.api-key=AIza...your-real-key`
               4. Set: `app.ai.provider=gemini` in `application.properties`
               5. Restart `start-dev.bat`

               **Option B — Use Ollama (100% Free, Local, Zero Latency)**
               1. Download Ollama from [ollama.com](https://ollama.com)
               2. Run: `ollama pull mistral` in your terminal
               3. Set: `app.ai.provider=ollama` in `application.properties`
               4. Restart `start-dev.bat`

               Check the Spring Boot terminal window for the exact error message.
               """;
    }

    // ─── Provider Status ─────────────────────────────────────────────────────────

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
            case "openai"    -> openAiChatClient != null && StringUtils.hasText(System.getenv("OPENAI_API_KEY")) ? "UP" : "DOWN";
            case "anthropic" -> StringUtils.hasText(anthropicApiKey) && !anthropicApiKey.startsWith("dummy") ? "UP" : "DOWN";
            case "ollama"    -> ollamaChatClient != null ? "UP" : "DOWN";
            case "gemini"    -> StringUtils.hasText(geminiApiKey) && !geminiApiKey.startsWith("your-") ? "UP" : "DOWN";
            default          -> "UNKNOWN";
        };
    }

    // ─── Continuous Learning (RAG Memory) ────────────────────────────────────────

    private void learnFromInteraction(String userMessage, String aiResponse) {
        if (vectorStore != null && StringUtils.hasText(userMessage) && StringUtils.hasText(aiResponse)) {
            try {
                String memory = "User: " + userMessage + "\nAI: " + aiResponse;
                org.springframework.ai.document.Document memDoc =
                        new org.springframework.ai.document.Document(
                                memory,
                                Map.of(
                                    "type",      "conversation_memory",
                                    "timestamp", System.currentTimeMillis(),
                                    "source",    "user_interaction"
                                )
                        );
                vectorStore.add(List.of(memDoc));

                // Persist to disk if using SimpleVectorStore
                if (vectorStore instanceof org.springframework.ai.vectorstore.SimpleVectorStore simpleStore) {
                    java.io.File vectorFile = new java.io.File(vectorStorePath);
                    vectorFile.getParentFile().mkdirs();
                    simpleStore.save(vectorFile);
                }

                logger.debug("🧠 [AiService] Learned from interaction — stored in vector memory");
            } catch (Exception e) {
                logger.warn("⚠️  [AiService] Failed to persist learning memory: {}", e.getMessage());
            }
        }
    }
}