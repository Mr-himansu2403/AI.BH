package com.aibh.dto;

import com.aibh.model.User;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authentication response")
public class AuthResponse {
    
    @Schema(description = "JWT access token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;
    
    @Schema(description = "JWT refresh token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refreshToken;
    
    @Schema(description = "User information")
    private UserInfo user;
    
    public AuthResponse() {}
    
    public AuthResponse(String token, String refreshToken, User user) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = new UserInfo(user);
    }
    
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    
    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }
    
    @Schema(description = "User information")
    public static class UserInfo {
        @Schema(description = "User ID", example = "1")
        private Long id;
        
        @Schema(description = "User email", example = "user@example.com")
        private String email;
        
        @Schema(description = "User first name", example = "John")
        private String firstName;
        
        @Schema(description = "User last name", example = "Doe")
        private String lastName;
        
        @Schema(description = "User role", example = "USER")
        private String role;
        
        public UserInfo() {}
        
        public UserInfo(User user) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.firstName = user.getFirstName();
            this.lastName = user.getLastName();
            this.role = user.getRole().name();
        }
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}