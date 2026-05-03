package com.aibh.service;

import com.aibh.model.Intent;
import org.springframework.stereotype.Service;

@Service
public class OutputStandardizationService {
    
    public String standardizeOutput(String response, Intent intent) {
        if (response == null || response.trim().isEmpty()) {
            return "I apologize, but I couldn't generate a proper response. Please try rephrasing your question.";
        }
        
        String standardized = response.trim();
        
        // Apply intent-specific formatting
        if (intent != null) {
            standardized = applyIntentFormatting(standardized, intent);
        }
        
        // Clean up common issues
        standardized = cleanupResponse(standardized);
        
        // Ensure proper ending
        standardized = ensureProperEnding(standardized);
        
        return standardized;
    }
    
    private String applyIntentFormatting(String response, Intent intent) {
        switch (intent.getType()) {
            case "technical":
                return formatTechnicalResponse(response);
            case "academic":
                return formatAcademicResponse(response);
            case "creative":
                return formatCreativeResponse(response);
            case "problem_solving":
                return formatProblemSolvingResponse(response);
            case "greeting":
                return formatGreetingResponse(response);
            default:
                return response;
        }
    }
    
    private String formatTechnicalResponse(String response) {
        // Ensure code blocks are properly formatted
        if (response.contains("```") && !response.endsWith("```")) {
            // Fix unclosed code blocks
            response = response + "\n```";
        }
        return response;
    }
    
    private String formatAcademicResponse(String response) {
        // Ensure mathematical expressions are clear
        return response.replaceAll("\\*\\*(.*?)\\*\\*", "$1"); // Remove excessive bold formatting
    }
    
    private String formatCreativeResponse(String response) {
        // Preserve creative formatting
        return response;
    }
    
    private String formatProblemSolvingResponse(String response) {
        // Ensure steps are clearly numbered if not already
        if (response.contains("step") && !response.matches(".*\\d+\\..*")) {
            // Add step numbering if missing
            String[] lines = response.split("\n");
            StringBuilder formatted = new StringBuilder();
            int stepNumber = 1;
            
            for (String line : lines) {
                if (line.toLowerCase().contains("step")) {
                    formatted.append(stepNumber++).append(". ").append(line).append("\n");
                } else {
                    formatted.append(line).append("\n");
                }
            }
            return formatted.toString().trim();
        }
        return response;
    }
    
    private String formatGreetingResponse(String response) {
        // Keep greetings concise and friendly
        if (response.length() > 200) {
            return response.substring(0, 197) + "...";
        }
        return response;
    }
    
    private String cleanupResponse(String response) {
        // Remove excessive whitespace
        response = response.replaceAll("\\n{3,}", "\n\n");
        
        // Fix common punctuation issues
        response = response.replaceAll("\\s+([.!?])", "$1");
        
        // Remove trailing whitespace from lines
        response = response.replaceAll("[ \t]+\n", "\n");
        
        return response;
    }
    
    private String ensureProperEnding(String response) {
        if (response.isEmpty()) {
            return response;
        }
        
        char lastChar = response.charAt(response.length() - 1);
        
        // If response doesn't end with proper punctuation, add a period
        if (!Character.toString(lastChar).matches("[.!?]")) {
            response += ".";
        }
        
        return response;
    }
}