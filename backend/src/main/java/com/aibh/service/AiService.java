package com.aibh.service;

import com.aibh.model.ChatMessage;
import com.aibh.model.Intent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatOptions;
// import org.springframework.ai.anthropic.AnthropicChatOptions;
import org.springframework.ai.ollama.OllamaChatOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiService {
    
    private static final Logger logger = LoggerFactory.getLogger(AiService.class);
    
    @Value("${app.ai.provider:openai}")
    private String aiProvider;
    
    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("openAiChatClient")
    private ChatClient openAiChatClient;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("ollamaChatClient")
    private ChatClient ollamaChatClient;

    @Autowired(required = false)
    private org.springframework.ai.vectorstore.VectorStore vectorStore;
    
    @Autowired(required = false)
    private IntentDetectionService intentDetectionService;
    
    @Autowired(required = false)
    private ModelRoutingService modelRoutingService;
    
    private ChatClient getChatClient() {
        return "ollama".equalsIgnoreCase(aiProvider) ? ollamaChatClient : openAiChatClient;
    }
    
    private static final String SYSTEM_PROMPT = 
        "You are AI.BH, a professional-grade AI assistant. Your goal is to provide DIRECT, ACCURATE, and filler-free answers.\n\n" +
        "CORE DIRECTIVES:\n" +
        "1. Start with the answer immediately. No 'Sure, I can help' or 'Based on the context'.\n" +
        "2. Be concise but technically deep when needed.\n" +
        "3. Use professional, clear language.\n" +
        "4. For code, provide only the working solution with minimal comments.\n\n" +
        "CONTEXT FROM DOCUMENTS:\n{context}";
    
    public String generateResponse(String userMessage, List<ChatMessage> conversationHistory) {
        try {
            Prompt prompt = buildPrompt(userMessage, conversationHistory);
            ChatResponse response = getChatClient().call(prompt);
            return response.getResult().getOutput().getContent();
        } catch (Exception e) {
            logger.error("Error generating AI response", e);
            return "ERROR: Unable to generate response. Check your API configuration.";
        }
    }

    public Flux<String> streamResponse(String userMessage, List<ChatMessage> conversationHistory) {
        try {
            Prompt prompt = buildPrompt(userMessage, conversationHistory);
            return getChatClient().stream(prompt)
                    .map(response -> response.getResult().getOutput().getContent())
                    .filter(StringUtils::hasText)
                    .onErrorResume(e -> {
                        logger.error("Streaming error", e);
                        return Flux.just("\n[Error: AI Stream Interrupted]");
                    });
        } catch (Exception e) {
            logger.error("Error initiating stream", e);
            return Flux.just("Error: Failed to connect to AI provider.");
        }
    }
    
    private Prompt buildPrompt(String userMessage, List<ChatMessage> conversationHistory) {
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

        return new Prompt(messages, getOptions(intent));
    }

    private Object getOptions(Intent intent) {
        float temp = (float) (modelRoutingService != null ? modelRoutingService.getTemperature(intent) : 0.7);

        return switch (aiProvider.toLowerCase()) {
            /* Anthropic support is temporarily disabled
            case "anthropic" -> AnthropicChatOptions.builder()
                .withModel("claude-3-sonnet-20240229")
                .withTemperature(temp)
                .build();
            */
            case "ollama" -> OllamaChatOptions.builder()
                .withModel("llama3")
                .withTemperature(temp)
                .build();
            case "openai" -> OpenAiChatOptions.builder()
                .withModel(modelRoutingService != null ? modelRoutingService.selectModel(intent, false) : "gpt-4o-mini")
                .withTemperature(temp)
                .build();
            default -> OpenAiChatOptions.builder().withModel("gpt-4o-mini").build();
        };
    }

    public String generateImageResponse(String message, String imageUrl, List<ChatMessage> history) {
        return "Vision support is currently being updated.";
    }

    public String generateIntelligentResponse(String message) {
        return "I'm sorry, I'm having trouble processing that right now.";
    }
}
