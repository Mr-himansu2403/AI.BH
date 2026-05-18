package com.aibh.service;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class AiServiceFallbackTest {

    @Test
    void reportsProviderAvailabilityWithoutConfiguredClients() {
        AiService service = new AiService();
        ReflectionTestUtils.setField(service, "aiProvider", "openai");
        ReflectionTestUtils.setField(service, "configuredProviders", List.of("openai", "gemini", "ollama"));
        ReflectionTestUtils.setField(service, "geminiApiKey", "");

        Map<String, String> statuses = service.getProviderStatus();

        assertEquals("DOWN", statuses.get("openai"));
        assertEquals("DOWN", statuses.get("gemini"));
        assertEquals("DOWN", statuses.get("ollama"));
        assertFalse(service.hasAtLeastOneAvailableProvider());
    }
}
