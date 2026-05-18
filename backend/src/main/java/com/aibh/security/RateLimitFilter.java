package com.aibh.security;

import com.aibh.service.RateLimitingService;
import com.aibh.service.RateLimitType;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);
    
    @Autowired
    private RateLimitingService rateLimitingService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        // Skip rate limiting for certain endpoints
        String requestURI = request.getRequestURI();
        if (shouldSkipRateLimit(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            // 1. Global IP-based rate limit
            String ipKey = "global:" + getClientIpAddress(request);
            if (!consumeToken(ipKey, RateLimitType.GLOBAL, response)) {
                return;
            }

            // 2. Specific user/anonymous rate limit
            String key = getRateLimitKey(request);
            RateLimitType type = getRateLimitType();
            
            if (consumeToken(key, type, response)) {
                filterChain.doFilter(request, response);
            }
            
        } catch (Exception e) {
            logger.error("Error in rate limiting filter", e);
            // Continue with request if rate limiting fails
            filterChain.doFilter(request, response);
        }
    }

    private boolean consumeToken(String key, RateLimitType type, HttpServletResponse response) throws IOException {
        Bucket bucket = rateLimitingService.getBucket(key, type);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        
        if (probe.isConsumed()) {
            // Add rate limit headers
            response.addHeader("X-RateLimit-Remaining-" + type.name(), String.valueOf(probe.getRemainingTokens()));
            return true;
        } else {
            // Rate limit exceeded
            logger.warn("Rate limit exceeded for key: {} (type: {})", key, type);
            
            response.setStatus(429); // Too Many Requests
            response.addHeader("X-RateLimit-Retry-After-" + type.name(), String.valueOf(probe.getNanosToWaitForRefill() / 1_000_000_000));
            response.setContentType("application/json");
            response.getWriter().write("""
                {
                    "error": "Rate limit exceeded",
                    "type": "%s",
                    "message": "Too many requests. Please try again later.",
                    "retryAfter": %d
                }
                """.formatted(type.name(), probe.getNanosToWaitForRefill() / 1_000_000_000));
            return false;
        }
    }
    
    private boolean shouldSkipRateLimit(String requestURI) {
        return requestURI.startsWith("/api/actuator/") ||
               requestURI.startsWith("/api/h2-console/") ||
               requestURI.startsWith("/api/swagger-ui/") ||
               requestURI.startsWith("/api/v3/api-docs") ||
               requestURI.equals("/api/aibh/health");
    }
    
    private String getRateLimitKey(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal user = (UserPrincipal) auth.getPrincipal();
            return "user:" + user.getId();
        } else {
            // Use IP address for anonymous users
            String clientIp = getClientIpAddress(request);
            return "ip:" + clientIp;
        }
    }
    
    private RateLimitType getRateLimitType() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal user = (UserPrincipal) auth.getPrincipal();
            if ("ADMIN".equals(user.getRole())) {
                return RateLimitType.ADMIN;
            } else if ("ENTERPRISE".equals(user.getRole())) {
                return RateLimitType.ENTERPRISE;
            } else {
                return RateLimitType.USER;
            }
        } else {
            return RateLimitType.ANONYMOUS;
        }
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
}