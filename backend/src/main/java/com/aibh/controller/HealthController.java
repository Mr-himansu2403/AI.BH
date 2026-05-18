package com.aibh.controller;

import com.aibh.config.JwtConfig;
import com.aibh.dto.HealthResponse;
import com.aibh.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/aibh")
public class HealthController {
    
    @Autowired
    private Environment environment;
    
    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtConfig jwtConfig;

    @Autowired
    private com.aibh.health.AiServiceHealthIndicator aiServiceHealthIndicator;

    @Autowired
    private com.aibh.service.AiService aiService;
    
    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        HealthResponse response = new HealthResponse("UP");
        boolean coreChecksPass = true;
        boolean aiChecksPass = true;

        try {
            userRepository.count();
            response.addCheck("database", "UP");
        } catch (Exception e) {
            response.addCheck("database", "DOWN");
            coreChecksPass = false;
        }

        try {
            jwtConfig.validateConfig();
            response.addCheck("jwt", "UP");
        } catch (Exception e) {
            response.addCheck("jwt", "DOWN");
            coreChecksPass = false;
        }

        try {
            org.springframework.boot.actuate.health.Health health = aiServiceHealthIndicator.health();
            response.addCheck("ai-service", health.getStatus().getCode());
            if (!"UP".equals(health.getStatus().getCode())) {
                aiChecksPass = false;
            }
        } catch (Exception e) {
            response.addCheck("ai-service", "DOWN");
            aiChecksPass = false;
        }

        aiService.getProviderStatus().forEach((provider, status) ->
            response.addCheck("provider-" + provider, status)
        );

        if (!aiService.hasAtLeastOneAvailableProvider()) {
            aiChecksPass = false;
            response.setMessage("No AI provider is currently available. Configure OpenAI, Gemini, or Ollama.");
        } else if (!coreChecksPass || !aiChecksPass) {
            response.setMessage("Service is partially degraded. Some dependencies are unavailable.");
        } else {
            response.setMessage("Service is ready.");
        }

        if (!coreChecksPass) {
            response.setStatus("DOWN");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }

        if (!aiChecksPass) {
            response.setStatus("DEGRADED");
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/health/detailed")
    public ResponseEntity<Map<String, Object>> detailedHealth() {
        Map<String, Object> health = new HashMap<>();
        
        // Basic info
        health.put("status", "UP");
        health.put("timestamp", System.currentTimeMillis());
        health.put("service", "AI.BH Backend");
        health.put("version", "1.0.0");
        
        // Environment info
        health.put("profile", environment.getActiveProfiles().length > 0 ? 
                   environment.getActiveProfiles()[0] : "default");
        health.put("port", environment.getProperty("server.port", "8080"));
        
        // Database health
        health.put("database", checkDatabaseHealth());
        health.put("providers", aiService.getProviderStatus());
        
        // Memory info
        Runtime runtime = Runtime.getRuntime();
        Map<String, Object> memory = new HashMap<>();
        memory.put("total", runtime.totalMemory());
        memory.put("free", runtime.freeMemory());
        memory.put("used", runtime.totalMemory() - runtime.freeMemory());
        memory.put("max", runtime.maxMemory());
        health.put("memory", memory);
        
        return ResponseEntity.ok(health);
    }
    
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "AI.BH");
        status.put("status", aiService.hasAtLeastOneAvailableProvider() ? "OPERATIONAL" : "DEGRADED");
        status.put("uptime", getUptime());
        status.put("endpoints", getAvailableEndpoints());
        status.put("providers", aiService.getProviderStatus());
        
        return ResponseEntity.ok(status);
    }
    
    private String checkDatabaseHealth() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(5) ? "UP" : "DOWN";
        } catch (Exception e) {
            return "DOWN - " + e.getMessage();
        }
    }
    
    private String getUptime() {
        long uptime = System.currentTimeMillis() - getStartTime();
        long seconds = uptime / 1000;
        long minutes = seconds / 60;
        long hours = minutes / 60;
        
        return String.format("%d hours, %d minutes, %d seconds", 
                           hours, minutes % 60, seconds % 60);
    }
    
    private long getStartTime() {
        // Approximate start time (this is a simple implementation)
        return System.currentTimeMillis() - 
               java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime();
    }
    
    private Map<String, String> getAvailableEndpoints() {
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("health", "/aibh/health");
        endpoints.put("chat", "/aibh/chat");
        endpoints.put("history", "/aibh/chat/history");
        endpoints.put("auth-signup", "/auth/signup");
        endpoints.put("auth-login", "/auth/login");
        endpoints.put("docs", "/swagger-ui/index.html");
        
        return endpoints;
    }
}
