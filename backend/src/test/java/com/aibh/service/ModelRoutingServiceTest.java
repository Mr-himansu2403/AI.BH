package com.aibh.service;

import com.aibh.model.Intent;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ModelRoutingServiceTest {

    private final ModelRoutingService service = new ModelRoutingService();

    @Test
    void selectsOpenAiModelsByIntent() {
        assertEquals("gpt-4o", service.selectModel(new Intent("technical", 0.9, "informational"), false, "openai"));
        assertEquals("gpt-4o-mini", service.selectModel(new Intent("general", 0.6, "conversational"), false, "openai"));
    }

    @Test
    void selectsGeminiModelsByIntent() {
        assertEquals("gemini-2.5-pro", service.selectModel(new Intent("academic", 0.8, "analytical"), false, "gemini"));
        assertEquals("gemini-2.0-flash", service.selectModel(new Intent("general", 0.6, "conversational"), false, "gemini"));
    }

    @Test
    void selectsOllamaModelsByIntent() {
        assertEquals("codellama", service.selectModel(new Intent("problem_solving", 0.8, "instructional"), false, "ollama"));
        assertEquals("llava", service.selectModel(new Intent("general", 0.6, "conversational"), true, "ollama"));
    }
}
