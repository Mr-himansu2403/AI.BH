package com.aibh.service;

import com.aibh.dto.AuthResponse;
import com.aibh.dto.LoginRequest;
import com.aibh.dto.SignupRequest;
import com.aibh.model.Role;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
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
    
    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        logger.info("Attempting login for user: {}", loginRequest.getEmail());
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String accessToken = tokenProvider.generateToken(userPrincipal);
        String refreshToken = tokenProvider.generateRefreshToken(userPrincipal);
        
        logger.info("User {} logged in successfully", loginRequest.getEmail());
        
        return new AuthResponse(
            accessToken,
            refreshToken,
            userPrincipal.getId(),
            userPrincipal.getEmail(),
            userPrincipal.getFullName(),
            userPrincipal.getRole()
        );
    }
    
    @Transactional
    public AuthResponse signup(SignupRequest signupRequest) {
        logger.info("Attempting signup for user: {}", signupRequest.getEmail());
        
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Email is already taken!");
        }
        
        // Create new user
        User user = new User();
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setRole(Role.USER);
        user.setEnabled(true);
        
        User savedUser = userRepository.save(user);
        
        // Generate tokens
        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        String accessToken = tokenProvider.generateToken(userPrincipal);
        String refreshToken = tokenProvider.generateRefreshToken(userPrincipal);
        
        logger.info("User {} registered successfully", signupRequest.getEmail());
        
        return new AuthResponse(
            accessToken,
            refreshToken,
            savedUser.getId(),
            savedUser.getEmail(),
            savedUser.getFullName(),
            savedUser.getRole()
        );
    }
    
    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }
        
        Long userId = tokenProvider.getUserIdFromToken(refreshToken);
        if (userId == null) {
            throw new RuntimeException("Invalid token: no user ID");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String newAccessToken = tokenProvider.generateToken(userPrincipal);
        String newRefreshToken = tokenProvider.generateRefreshToken(userPrincipal);
        
        return new AuthResponse(
            newAccessToken,
            newRefreshToken,
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole()
        );
    }
}