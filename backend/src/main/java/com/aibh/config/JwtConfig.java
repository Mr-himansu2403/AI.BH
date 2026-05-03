package com.aibh.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.security.SecureRandom;
import java.util.Base64;

@Configuration
@ConfigurationProperties(prefix = "app.jwt")
public class JwtConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtConfig.class);
    
    private String secret;
    private long expiration = 86400000; // Default 1 day
    private long refreshExpiration = 604800000; // Default 7 days
    
    @Value("${spring.profiles.active:development}")
    private String activeProfile;

    @PostConstruct
    public void validateConfig() {
        if (secret == null || secret.trim().isEmpty() || secret.getBytes().length < 32) {
            if ("production".equalsIgnoreCase(activeProfile)) {
                throw new IllegalStateException("JWT_SECRET is required and must be at least 32 bytes in production mode.");
            } else {
                logger.warn("JWT secret is not set or is less than 32 bytes. Generating a secure random secret for development.");
                byte[] randomBytes = new byte[32];
                new SecureRandom().nextBytes(randomBytes);
                this.secret = Base64.getEncoder().encodeToString(randomBytes);
            }
        }
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpiration() {
        return expiration;
    }

    public void setExpiration(long expiration) {
        this.expiration = expiration;
    }

    public long getRefreshExpiration() {
        return refreshExpiration;
    }

    public void setRefreshExpiration(long refreshExpiration) {
        this.refreshExpiration = refreshExpiration;
    }
}