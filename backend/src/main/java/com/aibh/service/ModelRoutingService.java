package com.aibh.service;

import com.aibh.model.Intent;
import org.springframework.stereotype.Service;

@Service
public class ModelRoutingService {
    
    public String selectModel(Intent intent, boolean hasImage) {
        if (hasImage) {
            return "gpt-4-vision-preview";
        }
        
        switch (intent.getType()) {
            case "programming":
                return "gpt-4o-mini"; // Good for code
            case "academic":
                return "gpt-4o-mini"; // Good for math/science
            case "greeting":
                return "gpt-3.5-turbo"; // Simple responses
            case "question":
            case "instruction":
                return "gpt-4o-mini"; // Detailed explanations
            default:
                return "gpt-4o-mini"; // Default model
        }
    }
    
    public int getMaxTokens(Intent intent) {
        switch (intent.getType()) {
            case "programming":
                return 1500; // More tokens for code examples
            case "academic":
                return 1200; // Detailed explanations
            case "greeting":
                return 100; // Short responses
            case "instruction":
                return 1000; // Step-by-step guides
            default:
                return 1000; // Default
        }
    }
    
    public double getTemperature(Intent intent) {
        switch (intent.getType()) {
            case "programming":
                return 0.3; // More deterministic for code
            case "academic":
                return 0.5; // Balanced for science
            case "greeting":
                return 0.8; // More creative for social
            default:
                return 0.7; // Default
        }
    }
}