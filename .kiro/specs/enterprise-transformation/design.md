# Design Document: Enterprise Transformation

## Overview
This document outlines the architectural and design decisions for transforming AI.BH into an enterprise-grade platform. The transformation focuses on security, observability, scalability, and developer experience.

## 1. Security & Authentication (Epic 1)

### 1.1 JWT-Based Authentication
- **Current State**: JWT is partially implemented but needs robust validation and configuration.
- **Enhancement**:
    - Centralized `JwtConfig` with environment-based secrets.
    - Token expiration management (Access tokens: 1 hour, Refresh tokens: 7 days).
    - Enhanced `JwtAuthenticationFilter` with proper error propagation.

### 1.2 Role-Based Access Control (RBAC)
- **Roles**: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_ENTERPRISE`.
- **Implementation**:
    - Annotate controllers with `@PreAuthorize`.
    - Configure `SecurityFilterChain` to enforce base access rules.
    - Map database roles to Spring Security `GrantedAuthority`.

## 2. Production Readiness (Epic 2)

### 2.1 Monitoring & Health Checks
- **Spring Boot Actuator**:
    - Enable `/health`, `/info`, `/metrics`, and `/prometheus`.
    - Custom Health Indicators: `DatabaseHealthIndicator`, `AiServiceHealthIndicator`.
- **Metrics**:
    - Micrometer for custom metrics (e.g., AI response time, intent detection accuracy).

### 2.2 Enterprise Logging
- **Logback Configuration**:
    - JSON format for Logstash/Elasticsearch compatibility.
    - MDC (Mapped Diagnostic Context) for `correlationId` tracking across threads.
    - Privacy Filters: Ensure no PII or secrets are logged.

## 3. Scalability & Performance (Epic 3)

### 3.1 Rate Limiting
- **Implementation**: Bucket4j integration.
- **Layers**:
    - IP-based global limit (e.g., 100 requests/minute).
    - User-based limit for AI endpoints (e.g., 20 chat messages/minute).
- **Storage**: In-memory (Caffeine) for single instance, prepared for Redis transition.

## 4. Developer Experience (Epic 4)

### 4.1 API Documentation
- **SpringDoc OpenAPI**:
    - Automatic schema generation.
    - Custom annotations for detailed endpoint descriptions.
    - Swagger UI available at `/swagger-ui.html`.

## 5. Architectural Diagram
```
[User] -> [Frontend (React)] -> [Rate Limit Filter] -> [Security Filter] -> [AuthController/ChatController]
                                                                        |
                                                                        -> [Services] -> [AI Engine/DB]
                                                                        |
                                                                        -> [Actuator/Prometheus]
```
