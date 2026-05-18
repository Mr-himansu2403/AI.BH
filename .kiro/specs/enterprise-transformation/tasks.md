# Implementation Plan: Enterprise Transformation

## Overview
This plan outlines the step-by-step tasks for the enterprise transformation of AI.BH.

## Tasks

### Epic 1: Advanced Security & RBAC

- [x] 1.1 Implement Role-Based Access Control (RBAC)
    - [x] Update `Role` enum with `ADMIN` and `ENTERPRISE` roles
    - [x] Update `SecurityConfig` to protect endpoints based on roles
    - [x] Add `@PreAuthorize` to admin-only operations (if any)
    - [x] Add unit tests for RBAC enforcement
- [x] 1.2 Enhance JWT Token Management
    - [x] Implement token blacklisting for logout (using Caffeine/In-memory)
    - [x] Add `issuedAt` and `notBefore` validation to JWT
    - [x] Add unit tests for token expiration and validation edge cases

### Epic 2: Production Readiness

- [x] 2.1 Advanced Monitoring with Actuator
    - [x] Configure custom `HealthIndicator` for AI Service (checking API connectivity)
    - [x] Enable and secure Prometheus metrics endpoint
    - [x] Implement custom Micrometer metrics for Chat latency
- [x] 2.2 Enterprise Logging Implementation
    - [x] Configure `logback-spring.xml` for JSON output
    - [x] Implement `LoggingInterceptor` for MDC correlation ID
    - [x] Verify sensitive data masking in logs
    - [x] Add property tests for log security

### Epic 3: Scalability & Performance

- [x] 3.1 Advanced Rate Limiting
    - [x] Configure global IP-based rate limit filter
    - [x] Implement authenticated user-based rate limiting in `ChatController`
    - [x] Create custom `RateLimitExceededException` and handler
    - [x] Add integration tests for rate limit enforcement

### Epic 4: Developer Experience

- [x] 4.1 OpenAPI/Swagger Documentation
    - [x] Enhance `OpenApiConfig` with enterprise metadata
    - [x] Add documentation annotations to all DTOs and Controllers
    - [x] Verify Swagger UI accessibility and correctness

### Epic 5: Final Verification

- [x] 5.1 End-to-End Enterprise Testing
    - [x] Test rate limiting under simulated load
    - [x] Verify MDC correlation IDs across logs
    - [x] Test RBAC with different user roles
    - [x] Run full test suite with zero failures
