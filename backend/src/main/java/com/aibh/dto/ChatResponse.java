package com.aibh.dto;

import java.time.LocalDateTime;

public class ChatResponse {
    
    private String response;
    private String sessionId;
    private LocalDateTime timestamp;
    private boolean success;
    private String error;
    
    public ChatResponse() {
        this.timestamp = LocalDateTime.now();
        this.success = true;
    }
    
    public ChatResponse(String response, String sessionId) {
        this();
        this.response = response;
        this.sessionId = sessionId;
    }
    
    public static ChatResponse error(String error) {
        ChatResponse response = new ChatResponse();
        response.success = false;
        response.error = error;
        return response;
    }
    
    // Getters and Setters
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}