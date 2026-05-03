package com.aibh.service;

import com.aibh.model.Intent;
import org.springframework.stereotype.Service;

@Service
public class ModelRoutingService {
    
    public String selectModel(Intent intent, boolean isVisionRequest) {
        if (isVisionRequest) {
            return "gpt-4-vision-preview";
        }
        
        if (intent == null) {
            return "gpt-4o-mini";
        }
        
        switch (intent.getType()) {
            case "technical":
            case "academic":
                return "gpt-4o"; // More capable model for complex tasks
            case "creative":
                return "gpt-4o"; // Better for creative tasks
            case "problem_solving":
                return "gpt-4o"; // Better reasoning capabilities
            case "greeting":
            case "general":
            default:
                return "gpt-4o-mini"; // Faster and cheaper for simple tasks
        }
    }
    
    public int getMaxTokens(Intent intent) {
        if (intent == null) {
            return 1000;
        }
        
        switch (intent.getType()) {
            case "technical":
            case "academic":
                return 2000; // More tokens for detailed explanations
            case "creative":
                return 1500; // More tokens for creative content
            case "problem_solving":
                return 1500; // More tokens for step-by-step solutions
            case "greeting":
                return 200; // Few tokens for simple greetings
            case "general":
            default:
                return 1000; // Standard token limit
        }
    }
    
    public double getTemperature(Intent intent) {
        if (intent == null) {
            return 0.7;
        }
        
        switch (intent.getType()) {
            case "technical":
            case "academic":
                return 0.3; // Lower temperature for factual accuracy
            case "creative":
                return 0.9; // Higher temperature for creativity
            case "problem_solving":
                return 0.5; // Balanced for structured thinking
            case "greeting":
                return 0.8; // Slightly higher for natural conversation
            case "general":
            default:
                return 0.7; // Balanced default
        }
    }
}