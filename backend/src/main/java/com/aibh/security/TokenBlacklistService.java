package com.aibh.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class TokenBlacklistService {

    // Cache to store blacklisted tokens with an expiration time
    private final Cache<String, Boolean> blacklistedTokens;

    public TokenBlacklistService() {
        // Initialize cache with a reasonable maximum size and eviction policy
        // In a real enterprise app, this would be Redis for distributed support
        this.blacklistedTokens = Caffeine.newBuilder()
                .expireAfterWrite(24, TimeUnit.HOURS) // Default expiration for safety
                .maximumSize(10000)
                .build();
    }

    /**
     * Blacklist a token.
     * @param token The JWT token to blacklist
     */
    public void blacklistToken(String token) {
        blacklistedTokens.put(token, Boolean.TRUE);
    }

    /**
     * Check if a token is blacklisted.
     * @param token The JWT token to check
     * @return true if blacklisted, false otherwise
     */
    public boolean isBlacklisted(String token) {
        return blacklistedTokens.getIfPresent(token) != null;
    }
}