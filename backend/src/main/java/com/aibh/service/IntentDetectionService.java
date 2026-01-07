package com.aibh.service;

import com.aibh.model.Intent;
import org.springframework.stereotype.Service;

@Service
public class IntentDetectionService {
    
    public Intent detectIntent(String userMessage) {
        // Simple intent detection logic
        String lowerMessage = userMessage.toLowerCase().trim();
        
        if (lowerMessage.contains("python") || lowerMessage.contains("java") || lowerMessage.contains("javascript")) {
            return new Intent("programming", 0.9, "technical");
        } else if (lowerMessage.contains("math") || lowerMessage.contains("calculus") || lowerMessage.contains("physics")) {
            return new Intent("academic", 0.8, "science");
        } else if (lowerMessage.matches("^(hello|hi|hey|good morning|good afternoon|good evening)!?$")) {
            return new Intent("greeting", 0.95, "social");
        } else if (lowerMessage.startsWith("what is") || lowerMessage.startsWith("what are")) {
            return new Intent("question", 0.85, "informational");
        } else if (lowerMessage.startsWith("how to") || lowerMessage.startsWith("how do")) {
            return new Intent("instruction", 0.8, "procedural");
        } else {
            return new Intent("general", 0.5, "conversational");
        }
    }
    
    public boolean isHighConfidence(Intent intent) {
        return intent.getConfidence() > 0.7;
    }
}