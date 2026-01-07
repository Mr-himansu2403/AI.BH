package com.aibh.controller;

import com.aibh.dto.AuthResponse;
import com.aibh.dto.LoginRequest;
import com.aibh.dto.SignupRequest;
import com.aibh.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse authResponse = authService.login(loginRequest);
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            logger.error("Login failed for user: {}", loginRequest.getEmail(), e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid email or password"));
        }
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            AuthResponse authResponse = authService.signup(signupRequest);
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            logger.error("Signup failed for user: {}", signupRequest.getEmail(), e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String refreshToken = request.get("refreshToken");
            if (refreshToken == null || refreshToken.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Refresh token is required"));
            }
            
            AuthResponse authResponse = authService.refreshToken(refreshToken);
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            logger.error("Token refresh failed", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid refresh token"));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // In a stateless JWT implementation, logout is handled client-side
        // by removing the token from storage
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}