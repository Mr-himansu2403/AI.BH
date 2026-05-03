package com.aibh.service;

public enum RateLimitType {
    ANONYMOUS,  // 10 requests/minute
    USER,       // 100 requests/minute
    ADMIN       // 1000 requests/minute
}