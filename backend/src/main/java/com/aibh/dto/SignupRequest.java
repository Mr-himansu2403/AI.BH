package com.aibh.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "User registration request")
public class SignupRequest {
    
    @NotBlank
    @Size(max = 100)
    @Schema(description = "User first name", example = "John", maxLength = 100)
    private String firstName;
    
    @NotBlank
    @Size(max = 100)
    @Schema(description = "User last name", example = "Doe", maxLength = 100)
    private String lastName;
    
    @Email
    @NotBlank
    @Schema(description = "User email address", example = "john.doe@example.com")
    private String email;
    
    @NotBlank
    @Size(min = 4, max = 100)
    @Schema(description = "User password", example = "securePassword123", minLength = 4, maxLength = 100)
    private String password;
    
    public SignupRequest() {}
    
    public SignupRequest(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}