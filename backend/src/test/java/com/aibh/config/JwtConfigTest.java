package com.aibh.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class JwtConfigTest {

    @Test
    public void testJwtSecretMinimumLength() {
        // Property 8: JWT Secret Minimum Length
        JwtConfig config = new JwtConfig();
        ReflectionTestUtils.setField(config, "activeProfile", "production");
        config.setSecret("short");

        IllegalStateException ex = assertThrows(IllegalStateException.class, config::validateConfig);
        assertTrue(ex.getMessage().contains("at least 32 bytes"));
    }

    @Test
    public void testProductionWithoutSecretFails() {
        JwtConfig config = new JwtConfig();
        ReflectionTestUtils.setField(config, "activeProfile", "production");
        
        IllegalStateException ex = assertThrows(IllegalStateException.class, config::validateConfig);
        assertTrue(ex.getMessage().contains("JWT_SECRET is required"));
    }

    @Test
    public void testDevelopmentGeneratesSecret() {
        JwtConfig config = new JwtConfig();
        ReflectionTestUtils.setField(config, "activeProfile", "development");
        
        config.validateConfig();
        assertNotNull(config.getSecret());
        assertTrue(config.getSecret().length() >= 32);
    }
    
    @Test
    public void testValidSecretPasses() {
        JwtConfig config = new JwtConfig();
        ReflectionTestUtils.setField(config, "activeProfile", "production");
        config.setSecret("this-is-a-very-long-secret-key-that-is-at-least-32-bytes-long");
        
        assertDoesNotThrow(config::validateConfig);
    }
}
