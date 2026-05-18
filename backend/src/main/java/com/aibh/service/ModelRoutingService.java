package com.aibh.service;

import com.aibh.model.Intent;
import org.springframework.stereotype.Service;

@Service
public class ModelRoutingService {
    
    public String selectModel(Intent intent, boolean isVisionRequest) {
        return selectModel(intent, isVisionRequest, "openai");
    }

    public String selectModel(Intent intent, boolean isVisionRequest, String provider) {
        String normalizedProvider = provider == null ? "openai" : provider.toLowerCase();

        if (isVisionRequest) {
            return switch (normalizedProvider) {
                case "gemini" -> "gemini-2.0-flash";
                case "ollama" -> "llava";
                default -> "gpt-4o";
            };
        }
        
        if (intent == null) {
            return defaultModelForProvider(normalizedProvider);
        }
        
        return switch (normalizedProvider) {
            case "anthropic" -> selectAnthropicModel(intent);
            case "gemini" -> selectGeminiModel(intent);
            case "ollama" -> selectOllamaModel(intent);
            default -> selectOpenAiModel(intent);
        };
    }

    private String selectOpenAiModel(Intent intent) {
        return switch (intent.getType()) {
            case "technical", "academic", "creative", "problem_solving" -> "gpt-4o";
            case "greeting", "general" -> "gpt-4o-mini";
            default -> "gpt-4o-mini";
        };
    }

    private String selectGeminiModel(Intent intent) {
        return switch (intent.getType()) {
            case "technical", "academic", "problem_solving" -> "gemini-2.5-pro";
            case "creative" -> "gemini-2.0-flash";
            case "greeting", "general" -> "gemini-2.0-flash";
            default -> "gemini-2.0-flash";
        };
    }

    private String selectAnthropicModel(Intent intent) {
        return switch (intent.getType()) {
            case "technical", "academic", "problem_solving" -> "claude-3-opus-20240229";
            case "creative", "greeting", "general" -> "claude-3-sonnet-20240229";
            default -> "claude-3-sonnet-20240229";
        };
    }

    private String selectOllamaModel(Intent intent) {
        return switch (intent.getType()) {
            case "technical", "academic", "problem_solving" -> "llama3";
            case "creative" -> "llama3";
            case "greeting", "general" -> "llama3";
            default -> "llama3";
        };
    }

    private String defaultModelForProvider(String provider) {
        return switch (provider) {
            case "anthropic" -> "claude-3-sonnet-20240229";
            case "gemini" -> "gemini-2.0-flash";
            case "ollama" -> "llama3";
            default -> "gpt-4o-mini";
        };
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