package com.aibh.service;

import com.aibh.model.ChatMessage;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
public class ContextManagementService {
    
    private static final int MAX_CONTEXT_MESSAGES = 10;
    private static final int MAX_CONTEXT_TOKENS = 4000;
    
    public List<ChatMessage> optimizeContext(List<ChatMessage> conversationHistory) {
        if (conversationHistory == null || conversationHistory.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Start with the most recent messages
        List<ChatMessage> optimizedContext = new ArrayList<>();
        int totalTokens = 0;
        int messageCount = 0;
        
        // Iterate from most recent to oldest
        for (int i = conversationHistory.size() - 1; i >= 0 && messageCount < MAX_CONTEXT_MESSAGES; i--) {
            ChatMessage message = conversationHistory.get(i);
            
            // Estimate token count (rough approximation: 1 token ≈ 4 characters)
            int messageTokens = estimateTokens(message);
            
            if (totalTokens + messageTokens > MAX_CONTEXT_TOKENS) {
                break; // Stop if adding this message would exceed token limit
            }
            
            optimizedContext.add(0, message); // Add to beginning to maintain chronological order
            totalTokens += messageTokens;
            messageCount++;
        }
        
        return optimizedContext;
    }
    
    private int estimateTokens(ChatMessage message) {
        int tokens = 0;
        
        if (message.getUserMessage() != null) {
            tokens += message.getUserMessage().length() / 4;
        }
        
        if (message.getAiResponse() != null) {
            tokens += message.getAiResponse().length() / 4;
        }
        
        return Math.max(tokens, 10); // Minimum 10 tokens per message
    }
    
    public boolean shouldIncludeMessage(ChatMessage message, String currentUserMessage) {
        if (message == null) {
            return false;
        }
        
        // Always include recent messages
        if (isRecentMessage(message)) {
            return true;
        }
        
        // Include messages that are contextually relevant
        return isContextuallyRelevant(message, currentUserMessage);
    }
    
    private boolean isRecentMessage(ChatMessage message) {
        // Consider messages from the last hour as recent
        long oneHourAgo = System.currentTimeMillis() - (60 * 60 * 1000);
        return message.getCreatedAt() != null && 
               message.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toEpochSecond() * 1000 > oneHourAgo;
    }
    
    private boolean isContextuallyRelevant(ChatMessage message, String currentUserMessage) {
        if (message.getUserMessage() == null || currentUserMessage == null) {
            return false;
        }
        
        String[] currentWords = currentUserMessage.toLowerCase().split("\\s+");
        String previousMessage = message.getUserMessage().toLowerCase();
        
        // Check if current message contains keywords from previous message
        for (String word : currentWords) {
            if (word.length() > 3 && previousMessage.contains(word)) {
                return true;
            }
        }
        
        return false;
    }
}