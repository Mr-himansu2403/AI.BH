package com.aibh.service;

import com.aibh.model.Intent;
import org.springframework.stereotype.Service;

@Service
public class OutputStandardizationService {
    
    public String standardizeOutput(String response, Intent intent) {
        if (response == null || response.trim().isEmpty()) {
            return "I apologize, but I couldn't generate a proper response. Please try again.";
        }
        
        String standardized = response.trim();
        
        // Apply intent-specific formatting
        switch (intent.getType()) {
            case "programming":
                standardized = formatProgrammingResponse(standardized);
                break;
            case "academic":
                standardized = formatAcademicResponse(standardized);
                break;
            case "greeting":
                standardized = formatGreetingResponse(standardized);
                break;
            case "question":
                standardized = formatQuestionResponse(standardized);
                break;
            case "instruction":
                standardized = formatInstructionResponse(standardized);
                break;
            default:
                standardized = formatGeneralResponse(standardized);
        }
        
        return standardized;
    }
    
    public boolean isValidResponse(String response) {
        return response != null && 
               !response.trim().isEmpty() && 
               response.length() > 5 && 
               !response.toLowerCase().contains("error") &&
               !response.toLowerCase().contains("i don't know");
    }
    
    public String addResponseMetadata(String response, Intent intent, String model) {
        // Add metadata for debugging/logging purposes
        return response + "\n\n<!-- Intent: " + intent.getType() + 
               ", Confidence: " + intent.getConfidence() + 
               ", Model: " + model + " -->";
    }
    
    private String formatProgrammingResponse(String response) {
        // Ensure code blocks are properly formatted
        if (response.contains("```") && !response.endsWith("```")) {
            response += "\n```";
        }
        return response;
    }
    
    private String formatAcademicResponse(String response) {
        // Ensure academic responses are well-structured
        return response;
    }
    
    private String formatGreetingResponse(String response) {
        // Keep greetings concise
        if (response.length() > 200) {
            return response.substring(0, 200) + "...";
        }
        return response;
    }
    
    private String formatQuestionResponse(String response) {
        // Ensure questions are answered directly
        return response;
    }
    
    private String formatInstructionResponse(String response) {
        // Ensure instructions are clear and numbered if needed
        return response;
    }
    
    private String formatGeneralResponse(String response) {
        // General formatting
        return response;
    }
}