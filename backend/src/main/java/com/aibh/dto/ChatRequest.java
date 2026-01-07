package com.aibh.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatRequest {
    
    @NotBlank(message = "Message cannot be empty")
    private String message;
    
    private String sessionId;
    private String imageUrl;
    private String messageType = "TEXT";
    
    public ChatRequest() {}
    
    public ChatRequest(String message, String sessionId) {
        this.message = message;
        this.sessionId = sessionId;
    }
    
    // Getters and Setters
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }
}