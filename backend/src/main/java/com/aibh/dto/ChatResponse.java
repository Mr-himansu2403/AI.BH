package com.aibh.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Chat response payload")
public class ChatResponse {
    
    @Schema(description = "AI generated response", example = "I am doing well, thank you!")
    private String response;

    @Schema(description = "Session ID for the conversation", example = "session_123456")
    private String sessionId;

    @Schema(description = "Timestamp of the response")
    private LocalDateTime timestamp;

    @Schema(description = "Indicates if the request was successful", example = "true")
    private boolean success;

    @Schema(description = "Error message if success is false", example = "Service unavailable")
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