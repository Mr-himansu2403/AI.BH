package com.aibh.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Authentication request")
public class AuthRequest {
    
    @Email
    @NotBlank
    @Schema(description = "User email address", example = "user@example.com")
    private String email;
    
    @NotBlank
    @Size(min = 4, max = 100)
    @Schema(description = "User password", example = "password123", minLength = 4, maxLength = 100)
    private String password;
    
    public AuthRequest() {}
    
    public AuthRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}