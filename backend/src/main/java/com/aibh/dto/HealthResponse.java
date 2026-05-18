package com.aibh.dto;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class HealthResponse {
    private String status;
    private LocalDateTime timestamp;
    private Map<String, String> checks;
    private String message;

    public HealthResponse() {
        this.timestamp = LocalDateTime.now();
        this.checks = new HashMap<>();
        this.message = "";
    }

    public HealthResponse(String status) {
        this();
        this.status = status;
    }

    public void addCheck(String name, String status) {
        this.checks.put(name, status);
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public Map<String, String> getChecks() { return checks; }
    public void setChecks(Map<String, String> checks) { this.checks = checks; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
