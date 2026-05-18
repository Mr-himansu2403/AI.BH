package com.aibh.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class RateLimitingService {
    
    private final ConcurrentMap<String, Bucket> cache = new ConcurrentHashMap<>();
    
    // Rate limit configurations
    private static final int ANONYMOUS_CAPACITY = 10;
    private static final int ANONYMOUS_REFILL = 10;
    private static final Duration ANONYMOUS_PERIOD = Duration.ofMinutes(1);
    
    private static final int USER_CAPACITY = 100;
    private static final int USER_REFILL = 100;
    private static final Duration USER_PERIOD = Duration.ofMinutes(1);

    private static final int ENTERPRISE_CAPACITY = 500;
    private static final int ENTERPRISE_REFILL = 500;
    private static final Duration ENTERPRISE_PERIOD = Duration.ofMinutes(1);
    
    private static final int ADMIN_CAPACITY = 1000;
    private static final int ADMIN_REFILL = 1000;
    private static final Duration ADMIN_PERIOD = Duration.ofMinutes(1);

    private static final int GLOBAL_CAPACITY = 5000;
    private static final int GLOBAL_REFILL = 5000;
    private static final Duration GLOBAL_PERIOD = Duration.ofMinutes(1);
    
    public Bucket getBucket(String key, RateLimitType type) {
        return cache.computeIfAbsent(key, k -> createBucket(type));
    }
    
    private Bucket createBucket(RateLimitType type) {
        Bandwidth bandwidth;
        
        switch (type) {
            case ANONYMOUS:
                bandwidth = Bandwidth.classic(ANONYMOUS_CAPACITY, 
                    Refill.intervally(ANONYMOUS_REFILL, ANONYMOUS_PERIOD));
                break;
            case USER:
                bandwidth = Bandwidth.classic(USER_CAPACITY, 
                    Refill.intervally(USER_REFILL, USER_PERIOD));
                break;
            case ENTERPRISE:
                bandwidth = Bandwidth.classic(ENTERPRISE_CAPACITY, 
                    Refill.intervally(ENTERPRISE_REFILL, ENTERPRISE_PERIOD));
                break;
            case ADMIN:
                bandwidth = Bandwidth.classic(ADMIN_CAPACITY, 
                    Refill.intervally(ADMIN_REFILL, ADMIN_PERIOD));
                break;
            case GLOBAL:
                bandwidth = Bandwidth.classic(GLOBAL_CAPACITY, 
                    Refill.intervally(GLOBAL_REFILL, GLOBAL_PERIOD));
                break;
            default:
                bandwidth = Bandwidth.classic(ANONYMOUS_CAPACITY, 
                    Refill.intervally(ANONYMOUS_REFILL, ANONYMOUS_PERIOD));
        }
        
        return Bucket.builder()
            .addLimit(bandwidth)
            .build();
    }
}