package com.aibh.controller;

import com.aibh.dto.AuthRequest;
import com.aibh.dto.AuthResponse;
import com.aibh.dto.SignupRequest;
import com.aibh.dto.RefreshTokenRequest;
import com.aibh.model.User;
import com.aibh.security.UserPrincipal;
import com.aibh.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@Tag(name = "Authentication", description = "User authentication and authorization operations")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    @Operation(
        summary = "User login", 
        description = "Authenticate user with email and password",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Login credentials",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AuthRequest.class),
                examples = @ExampleObject(
                    name = "Login Example",
                    value = """
                        {
                            "email": "user@example.com",
                            "password": "password123"
                        }
                        """
                )
            )
        )
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Login successful",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AuthResponse.class),
                examples = @ExampleObject(
                    name = "Success Response",
                    value = """
                        {
                            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            "user": {
                                "id": 1,
                                "email": "user@example.com",
                                "firstName": "John",
                                "lastName": "Doe",
                                "role": "USER"
                            }
                        }
                        """
                )
            )
        ),
        @ApiResponse(
            responseCode = "401", 
            description = "Invalid credentials",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "Error Response",
                    value = """
                        {
                            "message": "Invalid email or password",
                            "timestamp": "2025-01-26T10:30:00Z"
                        }
                        """
                )
            )
        ),
        @ApiResponse(responseCode = "429", description = "Rate limit exceeded")
    })
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            logger.info("Login attempt for email: {}", request.getEmail());
            AuthResponse response = authService.login(request);
            logger.info("Login successful for email: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Login failed for email: {}", request.getEmail(), e);
            return ResponseEntity.status(401).body(Map.of(
                "message", e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }
    
    @PostMapping("/signup")
    @Operation(
        summary = "User registration", 
        description = "Register a new user account",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "User registration details",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = SignupRequest.class),
                examples = @ExampleObject(
                    name = "Signup Example",
                    value = """
                        {
                            "firstName": "John",
                            "lastName": "Doe",
                            "email": "john.doe@example.com",
                            "password": "securePassword123"
                        }
                        """
                )
            )
        )
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Registration successful",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AuthResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Invalid input or email already exists",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "Error Response",
                    value = """
                        {
                            "message": "Email already exists",
                            "timestamp": "2025-01-26T10:30:00Z"
                        }
                        """
                )
            )
        ),
        @ApiResponse(responseCode = "429", description = "Rate limit exceeded")
    })
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        try {
            logger.info("Signup attempt for email: {}", request.getEmail());
            AuthResponse response = authService.signup(request);
            logger.info("Signup successful for email: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Signup failed for email: {}", request.getEmail(), e);
            return ResponseEntity.status(400).body(Map.of(
                "message", e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }
    
    @PostMapping("/refresh")
    @Operation(
        summary = "Refresh access token", 
        description = "Get a new access token using refresh token",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Refresh token",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = RefreshTokenRequest.class),
                examples = @ExampleObject(
                    name = "Refresh Token Example",
                    value = """
                        {
                            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        }
                        """
                )
            )
        )
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Token refreshed successfully",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "Success Response",
                    value = """
                        {
                            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        }
                        """
                )
            )
        ),
        @ApiResponse(
            responseCode = "401", 
            description = "Invalid or expired refresh token"
        )
    })
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        logger.info("Token refresh attempt");
        AuthResponse response = authService.refreshToken(request);
        logger.info("Token refresh successful");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/logout")
    @Operation(
        summary = "User logout", 
        description = "Logout user and invalidate tokens",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logout successful"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserPrincipal user) {
        logger.info("Logout for user: {}", user.getEmail());
        authService.logout(user);
        logger.info("Logout successful for user: {}", user.getEmail());
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/me")
    @Operation(
        summary = "Get current user", 
        description = "Get current authenticated user information",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "User information retrieved",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = User.class),
                examples = @ExampleObject(
                    name = "User Info Response",
                    value = """
                        {
                            "id": 1,
                            "email": "user@example.com",
                            "firstName": "John",
                            "lastName": "Doe",
                            "role": "USER",
                            "enabled": true,
                            "createdAt": "2025-01-26T10:30:00Z"
                        }
                        """
                )
            )
        ),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserPrincipal user) {
        logger.info("Getting current user info for: {}", user.getEmail());
        User currentUser = authService.getCurrentUser(user);
        return ResponseEntity.ok(currentUser);
    }
}