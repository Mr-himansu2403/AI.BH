package com.aibh.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TokenBlacklistServiceTest {

    private TokenBlacklistService blacklistService;

    @BeforeEach
    void setUp() {
        blacklistService = new TokenBlacklistService();
    }

    @Test
    void testBlacklistToken() {
        String token = "some.jwt.token";
        assertFalse(blacklistService.isBlacklisted(token));
        
        blacklistService.blacklistToken(token);
        assertTrue(blacklistService.isBlacklisted(token));
    }

    @Test
    void testMultipleTokens() {
        String token1 = "token1";
        String token2 = "token2";
        
        blacklistService.blacklistToken(token1);
        
        assertTrue(blacklistService.isBlacklisted(token1));
        assertFalse(blacklistService.isBlacklisted(token2));
    }
}