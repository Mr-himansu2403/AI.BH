package com.aibh.controller;

import com.aibh.config.JwtConfig;
import com.aibh.dto.HealthResponse;
import com.aibh.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class HealthControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtConfig jwtConfig;

    @InjectMocks
    private HealthController healthController;

    @Test
    public void testHealthCheckAllPass() {
        when(userRepository.count()).thenReturn(1L);
        doNothing().when(jwtConfig).validateConfig();

        ResponseEntity<HealthResponse> response = healthController.health();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("UP", response.getBody().getStatus());
        assertEquals("UP", response.getBody().getChecks().get("database"));
        assertEquals("UP", response.getBody().getChecks().get("jwt"));
    }

    @Test
    public void testHealthCheckDatabaseFailure() {
        when(userRepository.count()).thenThrow(new RuntimeException("DB Error"));
        // Property 9: Health Check Failure Response
        
        ResponseEntity<HealthResponse> response = healthController.health();

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertEquals("DOWN", response.getBody().getStatus());
        assertEquals("DOWN", response.getBody().getChecks().get("database"));
    }

    @Test
    public void testHealthCheckJwtFailure() {
        when(userRepository.count()).thenReturn(1L);
        doThrow(new IllegalStateException("JWT Error")).when(jwtConfig).validateConfig();

        ResponseEntity<HealthResponse> response = healthController.health();

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertEquals("DOWN", response.getBody().getStatus());
        assertEquals("DOWN", response.getBody().getChecks().get("jwt"));
    }
}