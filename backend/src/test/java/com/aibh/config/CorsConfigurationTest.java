package com.aibh.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;

public class CorsConfigurationTest {

    @Test
    public void testCorsConfiguration() {
        SecurityConfig config = new SecurityConfig();
        CorsConfigurationSource source = config.corsConfigurationSource();
        
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/auth/login");
        request.setServerName("localhost");
        request.setServerPort(5173);
        request.addHeader("Origin", "http://localhost:5173");
        
        CorsConfiguration cors = source.getCorsConfiguration(request);
        
        assertNotNull(cors);
        assertTrue(cors.getAllowedOrigins().contains("http://localhost:5173"));
        assertTrue(cors.getAllowedMethods().contains("OPTIONS"));
        assertTrue(cors.getAllowCredentials());
        assertTrue(cors.getExposedHeaders().contains("Authorization"));
        assertTrue(cors.getExposedHeaders().contains("Content-Type"));
        assertEquals(3600L, cors.getMaxAge());
    }
}
