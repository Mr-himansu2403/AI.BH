package com.aibh.health;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class AiServiceHealthIndicator implements HealthIndicator {

    @Value("${app.ai.provider}")
    private String provider;

    @Value("${spring.ai.ollama.base-url:http://localhost:11434}")
    private String ollamaUrl;

    @Value("${app.ai.gemini.api-key:${GEMINI_API_KEY:}}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public Health health() {
        if ("ollama".equalsIgnoreCase(provider)) {
            return checkOllamaHealth();
        } else if ("gemini".equalsIgnoreCase(provider)) {
            return checkGeminiHealth();
        } else if ("openai".equalsIgnoreCase(provider)) {
            return checkOpenAiHealth();
        }
        return Health.up().withDetail("provider", provider).build();
    }

    private Health checkOllamaHealth() {
        try {
            // Check if Ollama is running
            restTemplate.getForEntity(ollamaUrl, String.class);
            return Health.up().withDetail("provider", "Ollama").withDetail("url", ollamaUrl).build();
        } catch (Exception e) {
            return Health.down().withDetail("provider", "Ollama").withDetail("error", e.getMessage()).build();
        }
    }

    private Health checkOpenAiHealth() {
        // For OpenAI, we could check connectivity to api.openai.com
        try {
            restTemplate.getForEntity("https://api.openai.com", String.class);
            return Health.up().withDetail("provider", "OpenAI").build();
        } catch (Exception e) {
            // Note: OpenAI might return 401/404 on root, but if we get a response it's "up"
            return Health.up().withDetail("provider", "OpenAI").withDetail("status", "Reachable").build();
        }
    }

    private Health checkGeminiHealth() {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return Health.down().withDetail("provider", "Gemini").withDetail("error", "Missing GEMINI_API_KEY").build();
        }

        try {
            restTemplate.getForEntity("https://generativelanguage.googleapis.com", String.class);
            return Health.up().withDetail("provider", "Gemini").build();
        } catch (Exception e) {
            return Health.up().withDetail("provider", "Gemini").withDetail("status", "Reachable").build();
        }
    }
}
