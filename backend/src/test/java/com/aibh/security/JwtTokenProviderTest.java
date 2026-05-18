package com.aibh.security;

import com.aibh.config.JwtConfig;
import com.aibh.model.Role;
import com.aibh.model.User;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.PrematureJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;

    @Mock
    private JwtConfig jwtConfig;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(jwtConfig.getSecret()).thenReturn("9a4f2c8d3b7a1e5f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d");
        when(jwtConfig.getExpiration()).thenReturn(3600000L); // 1 hour
        when(jwtConfig.getRefreshExpiration()).thenReturn(604800000L); // 7 days
        tokenProvider = new JwtTokenProvider(jwtConfig);
    }

    @Test
    void testGenerateAndValidateToken() {
        User user = new User("test@example.com", "password", "Test", "User");
        user.setId(1L);
        user.setRole(Role.USER);
        UserPrincipal principal = UserPrincipal.create(user);

        String token = tokenProvider.generateToken(principal);
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals(1L, tokenProvider.getUserIdFromToken(token));
    }

    @Test
    void testTokenWithEnterpriseRole() {
        User user = new User("enterprise@example.com", "password", "Enterprise", "User");
        user.setId(2L);
        user.setRole(Role.ENTERPRISE);
        UserPrincipal principal = UserPrincipal.create(user);

        String token = tokenProvider.generateToken(principal);
        assertTrue(tokenProvider.validateToken(token));
    }

    @Test
    void testExpiredToken() {
        // Set expiration to a negative value to simulate expired token
        when(jwtConfig.getExpiration()).thenReturn(-1000L);
        
        User user = new User("expired@example.com", "password", "Expired", "User");
        user.setId(3L);
        UserPrincipal principal = UserPrincipal.create(user);

        String token = tokenProvider.generateToken(principal);
        assertFalse(tokenProvider.validateToken(token));
    }
}