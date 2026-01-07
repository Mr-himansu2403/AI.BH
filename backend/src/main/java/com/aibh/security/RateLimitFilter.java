package com.aibh.security;

import com.aibh.model.Role;
import com.aibh.service.RateLimitingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);
    
    @Autowired
    private RateLimitingService rateLimitingService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, 
                                  @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        // Skip rate limiting for certain endpoints
        String requestURI = request.getRequestURI();
        if (shouldSkipRateLimit(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String key = getRateLimitKey(request);
        RateLimitingService.RateLimitType type = getRateLimitType(request);
        
        if (!rateLimitingService.tryConsume(key, type)) {
            logger.warn("Rate limit exceeded for key: {} with type: {}", key, type);
            sendRateLimitExceededResponse(response, key, type);
            return;
        }
        
        // Add rate limit headers
        addRateLimitHeaders(response, key, type);
        
        filterChain.doFilter(request, response);
    }
    
    private boolean shouldSkipRateLimit(String requestURI) {
        return requestURI.contains("/actuator/health") || 
               requestURI.contains("/h2-console") ||
               requestURI.contains("/swagger-ui") ||
               requestURI.contains("/v3/api-docs");
    }
    
    private String getRateLimitKey(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() && 
            authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            return "user:" + userPrincipal.getId();
        }
        
        // Use IP address for anonymous users
        String clientIp = getClientIpAddress(request);
        return "ip:" + clientIp;
    }
    
    private RateLimitingService.RateLimitType getRateLimitType(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() && 
            authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            
            if (userPrincipal.getRole() == Role.ADMIN) {
                return RateLimitingService.RateLimitType.ADMIN;
            } else {
                return RateLimitingService.RateLimitType.USER;
            }
        }
        
        return RateLimitingService.RateLimitType.ANONYMOUS;
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    private void addRateLimitHeaders(HttpServletResponse response, String key, 
                                   RateLimitingService.RateLimitType type) {
        long availableTokens = rateLimitingService.getAvailableTokens(key, type);
        response.setHeader("X-RateLimit-Remaining", String.valueOf(availableTokens));
        response.setHeader("X-RateLimit-Type", type.name());
    }
    
    private void sendRateLimitExceededResponse(HttpServletResponse response, String key, 
                                             RateLimitingService.RateLimitType type) throws IOException {
        response.setStatus(429); // HTTP 429 Too Many Requests
        response.setContentType("application/json");
        response.setHeader("X-RateLimit-Remaining", "0");
        response.setHeader("X-RateLimit-Type", type.name());
        response.setHeader("Retry-After", "60"); // Retry after 60 seconds
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Rate limit exceeded");
        errorResponse.put("message", "Too many requests. Please try again later.");
        errorResponse.put("type", type.name());
        errorResponse.put("retryAfter", 60);
        
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}