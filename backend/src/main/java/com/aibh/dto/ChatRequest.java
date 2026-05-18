package com.aibh.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Chat request payload")
public class ChatRequest {
    
    @NotBlank(message = "Message cannot be empty")
    @Schema(description = "User's message content", example = "Hello, how are you?")
    private String message;
    
    @Schema(description = "Session ID for conversation context", example = "session_123456")
    private String sessionId;

    @Schema(description = "URL of an image for multi-modal chat", example = "https://example.com/image.jpg")
    private String imageUrl;

    @Schema(description = "Type of message (TEXT, IMAGE)", example = "TEXT", defaultValue = "TEXT")
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