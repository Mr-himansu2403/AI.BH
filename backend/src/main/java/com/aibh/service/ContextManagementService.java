package com.aibh.service;

import com.aibh.model.ChatMessage;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;

@Service
public class ContextManagementService {
    
    private static final int MAX_CONTEXT_MESSAGES = 10;
    private static final int MAX_CONTEXT_TOKENS = 3000;
    
    public List<ChatMessage> optimizeContext(List<ChatMessage> conversationHistory) {
        if (conversationHistory == null || conversationHistory.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Keep only recent messages to stay within token limits
        List<ChatMessage> optimizedContext = new ArrayList<>();
        int tokenCount = 0;
        int messageCount = 0;
        
        // Start from the most recent messages
        for (int i = conversationHistory.size() - 1; i >= 0 && messageCount < MAX_CONTEXT_MESSAGES; i--) {
            ChatMessage message = conversationHistory.get(i);
            int messageTokens = estimateTokens(message.getUserMessage()) + estimateTokens(message.getAiResponse());
            
            if (tokenCount + messageTokens > MAX_CONTEXT_TOKENS) {
                break;
            }
            
            optimizedContext.add(0, message); // Add to beginning to maintain order
            tokenCount += messageTokens;
            messageCount++;
        }
        
        return optimizedContext;
    }
    
    public boolean shouldIncludeContext(List<ChatMessage> conversationHistory) {
        return conversationHistory != null && !conversationHistory.isEmpty();
    }
    
    public String summarizeContext(List<ChatMessage> conversationHistory) {
        if (conversationHistory == null || conversationHistory.isEmpty()) {
            return "";
        }
        
        StringBuilder summary = new StringBuilder();
        summary.append("Previous conversation context:\n");
        
        for (ChatMessage message : conversationHistory) {
            if (message.getUserMessage() != null && !message.getUserMessage().trim().isEmpty()) {
                summary.append("user: ")
                       .append(truncateMessage(message.getUserMessage(), 100))
                       .append("\n");
            }
            if (message.getAiResponse() != null && !message.getAiResponse().trim().isEmpty()) {
                summary.append("assistant: ")
                       .append(truncateMessage(message.getAiResponse(), 100))
                       .append("\n");
            }
        }
        
        return summary.toString();
    }
    
    private int estimateTokens(String text) {
        if (text == null) return 0;
        // Rough estimation: 1 token ≈ 4 characters
        return text.length() / 4;
    }
    
    private String truncateMessage(String message, int maxLength) {
        if (message.length() <= maxLength) {
            return message;
        }
        return message.substring(0, maxLength) + "...";
    }
}