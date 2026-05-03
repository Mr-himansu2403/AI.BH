package com.aibh.service;

import com.aibh.dto.AuthRequest;
import com.aibh.dto.AuthResponse;
import com.aibh.dto.SignupRequest;
import com.aibh.dto.RefreshTokenRequest;
import com.aibh.model.User;
import com.aibh.repository.UserRepository;
import com.aibh.security.JwtTokenProvider;
import com.aibh.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    public AuthResponse login(AuthRequest request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );
            
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            
            // Generate tokens
            String token = tokenProvider.generateToken(userPrincipal);
            String refreshToken = tokenProvider.generateRefreshToken(userPrincipal);
            
            // Get user entity
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            logger.info("Login successful for user: {}", request.getEmail());
            return new AuthResponse(token, refreshToken, user);
            
        } catch (org.springframework.security.core.AuthenticationException e) {
            logger.warn("Login failed for user: {}", request.getEmail());
            throw e;
        }
    }
    
    public AuthResponse signup(SignupRequest request) {
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new org.springframework.dao.DataIntegrityViolationException("Email already exists");
            }
            
            // Create new user
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEnabled(true);
            
            // Save user
            user = userRepository.save(user);
            
            // Create user principal
            UserPrincipal userPrincipal = UserPrincipal.create(user);
            
            // Generate tokens
            String token = tokenProvider.generateToken(userPrincipal);
            String refreshToken = tokenProvider.generateRefreshToken(userPrincipal);
            
            logger.info("Signup successful for user: {}", request.getEmail());
            return new AuthResponse(token, refreshToken, user);
            
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            logger.warn("Signup failed for user: {} - Email already exists", request.getEmail());
            throw e;
        } catch (Exception e) {
            logger.warn("Signup failed for user: {} - {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }
    
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        try {
            String refreshToken = request.getRefreshToken();
            
            if (!tokenProvider.validateToken(refreshToken)) {
                throw new org.springframework.security.authentication.BadCredentialsException("Invalid refresh token");
            }
            
            Long userId = tokenProvider.getUserIdFromToken(refreshToken);
            User user = userRepository.findActiveById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!user.getEnabled()) {
                throw new org.springframework.security.authentication.DisabledException("User account is disabled");
            }
            
            UserPrincipal userPrincipal = UserPrincipal.create(user);
            
            // Generate new tokens
            String newToken = tokenProvider.generateToken(userPrincipal);
            String newRefreshToken = tokenProvider.generateRefreshToken(userPrincipal);
            
            logger.info("Token refresh successful for user: {}", user.getEmail());
            return new AuthResponse(newToken, newRefreshToken, user);
            
        } catch (Exception e) {
            logger.warn("Token refresh failed: {}", e.getMessage());
            throw e;
        }
    }
    
    public void logout(UserPrincipal user) {
        // In a more sophisticated implementation, you would:
        // 1. Add the token to a blacklist
        // 2. Store blacklisted tokens in Redis with expiration
        // 3. Check blacklist in JWT filter
        
        // For now, we just log the logout
        logger.info("User logged out: {}", user.getEmail());
        
        // Client-side token removal is handled by the frontend
    }
    
    public User getCurrentUser(UserPrincipal userPrincipal) {
        return userRepository.findActiveById(userPrincipal.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}