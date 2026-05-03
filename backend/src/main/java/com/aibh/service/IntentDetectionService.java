package com.aibh.service;

import com.aibh.model.Intent;
import org.springframework.stereotype.Service;

@Service
public class IntentDetectionService {
    
    public Intent detectIntent(String userMessage) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return new Intent("general", 0.5, "conversational");
        }
        
        String lowerMessage = userMessage.toLowerCase().trim();
        
        // Technical questions
        if (containsAny(lowerMessage, "code", "programming", "java", "python", "javascript", "sql", "database")) {
            return new Intent("technical", 0.9, "informational");
        }
        
        // Math/Science questions
        if (containsAny(lowerMessage, "calculate", "math", "physics", "chemistry", "formula", "equation")) {
            return new Intent("academic", 0.8, "analytical");
        }
        
        // Creative tasks
        if (containsAny(lowerMessage, "write", "create", "generate", "design", "story", "poem")) {
            return new Intent("creative", 0.7, "generative");
        }
        
        // Problem-solving
        if (containsAny(lowerMessage, "how to", "help", "solve", "fix", "troubleshoot", "debug")) {
            return new Intent("problem_solving", 0.8, "instructional");
        }
        
        // Greetings and casual
        if (containsAny(lowerMessage, "hello", "hi", "hey", "good morning", "good afternoon", "thanks")) {
            return new Intent("greeting", 0.9, "conversational");
        }
        
        // Default to general
        return new Intent("general", 0.6, "conversational");
    }
    
    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }
}