# Implementation Plan: Authentication Fixes

## Overview

This implementation plan addresses critical authentication issues in the AI-BH application by fixing null safety warnings, implementing database initialization with demo users, enhancing error handling, and improving CORS configuration. The tasks are organized to build incrementally, with testing integrated throughout to validate correctness early.

## Tasks

- [x] 1. Fix null safety annotations in JWT authentication filter
  - Add @NonNull annotations to doFilterInternal method parameters (request, response, filterChain)
  - Import org.springframework.lang.NonNull
  - Verify compilation produces zero null safety warnings
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Create error response and exception handling infrastructure
  - [x] 2.1 Create ErrorResponse data model
    - Add fields: message, status, timestamp, fieldErrors map
    - Add constructors and helper methods
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 2.2 Create GlobalExceptionHandler
    - Handle BadCredentialsException → 401 with "Invalid email or password"
    - Handle DisabledException → 401 with "Account is disabled"
    - Handle MethodArgumentNotValidException → 400 with field errors
    - Handle DataIntegrityViolationException → 400 with "Email already exists"
    - Handle generic Exception → 500 with "An unexpected error occurred"
    - Add appropriate logging for each exception type
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.2_
  
  - [x] 2.3 Write property test for authentication failure status codes
    - **Property 4: Authentication Failure Status Codes**
    - **Validates: Requirements 5.6**
  
  - [x] 2.4 Write property test for validation failure status codes
    - **Property 5: Validation Failure Status Codes**
    - **Validates: Requirements 5.7**
  
  - [x] 2.5 Write property test for unexpected error status codes
    - **Property 6: Unexpected Error Status Codes**
    - **Validates: Requirements 5.8**
  
  - [x] 2.6 Write property test for validation error field mapping
    - **Property 3: Validation Error Field Mapping**
    - **Validates: Requirements 5.4**

- [x] 3. Enhance AuthService with improved error handling
  - Update login method to let exceptions propagate to GlobalExceptionHandler
  - Update signup method to let exceptions propagate to GlobalExceptionHandler
  - Update refreshToken method to let exceptions propagate to GlobalExceptionHandler
  - Add INFO logging for successful operations (login, signup)
  - Add WARN logging for failed operations (without sensitive data)
  - Ensure no passwords or tokens are logged
  - _Requirements: 5.1, 5.2, 5.3, 5.5, 6.1, 6.2, 6.3, 6.6_

- [x] 3.1 Write property test for log security
  - **Property 7: Log Security - No Sensitive Data**
  - **Validates: Requirements 6.6**

- [x] 4. Implement database initialization with demo user
  - [x] 4.1 Create DatabaseInitializer component
    - Implement ApplicationRunner interface
    - Check if demo user (demo@aibh.com) exists
    - Create demo user if missing with BCrypt-encoded password "demo1234"
    - Set firstName="Demo", lastName="User", role=USER, enabled=true
    - Log INFO message with initialization status
    - Handle errors gracefully without blocking startup
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 6.5_
  
  - [x] 4.2 Write property test for database initialization idempotence
    - **Property 1: Database Initialization Idempotence**
    - **Validates: Requirements 2.3**
  
  - [x] 4.3 Write unit test for demo user creation
    - Verify demo user exists after initialization
    - Verify password is BCrypt encoded
    - Verify user properties are correct
    - _Requirements: 2.1, 2.2_
  
  - [x] 4.4 Write unit test for initialization error handling
    - Simulate database error during initialization
    - Verify application continues startup
    - Verify error is logged
    - _Requirements: 2.5_

- [x] 5. Update database configuration for persistence
  - Change spring.datasource.url from jdbc:h2:mem:aibh_dev to jdbc:h2:file:./data/aibh_dev
  - Change spring.jpa.hibernate.ddl-auto from create-drop to update
  - Create data directory if it doesn't exist
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5.1 Write property test for data persistence across restarts
  - **Property 2: Data Persistence Across Restarts**
  - **Validates: Requirements 3.3**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Enhance CORS configuration
  - Update corsConfigurationSource to explicitly allow http://localhost:5173
  - Add setExposedHeaders for Authorization and Content-Type
  - Set maxAge to 3600L for preflight caching
  - Verify setAllowCredentials is true
  - Verify setAllowedMethods includes OPTIONS
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7.1 Write unit tests for CORS configuration
  - Test OPTIONS preflight request returns correct headers
  - Test requests from localhost:5173 are allowed
  - Test Authorization header is allowed
  - Test credentials are allowed
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Implement JWT configuration validation
  - [x] 8.1 Create JwtConfig component
    - Add @ConfigurationProperties(prefix = "app.jwt")
    - Add fields: secret, expiration, refreshExpiration
    - Add @PostConstruct validateConfig method
    - Validate secret length >= 32 bytes
    - Generate secure random secret if not provided in development
    - Fail startup if JWT_SECRET not set in production mode
    - Log warning when using default secret in development
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 8.2 Update JwtTokenProvider to use JwtConfig
    - Inject JwtConfig instead of @Value annotations
    - Use JwtConfig getters for secret, expiration, refreshExpiration
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 8.3 Write property test for JWT secret minimum length
    - **Property 8: JWT Secret Minimum Length**
    - **Validates: Requirements 7.3**
  
  - [x] 8.4 Write unit tests for JWT configuration validation
    - Test startup fails with short secret
    - Test startup fails in production without JWT_SECRET
    - Test warning logged when using default in development
    - Test secure random secret generation
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

- [x] 9. Implement health check endpoint
  - [x] 9.1 Create HealthResponse data model
    - Add fields: status, checks map, timestamp
    - Add helper method addCheck(name, status)
    - _Requirements: 10.1, 10.4, 10.5_
  
  - [x] 9.2 Create HealthController
    - Add GET endpoint at /aibh/health
    - Check database connectivity by calling userRepository.count()
    - Check JWT configuration validity
    - Return 200 with status "UP" if all checks pass
    - Return 503 with status "DOWN" if any check fails
    - Include check details in response
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 9.3 Update SecurityConfig to allow unauthenticated access to health endpoint
    - Add /aibh/health to permitAll() list
    - _Requirements: 10.6_
  
  - [x] 9.4 Write property test for health check failure response
    - **Property 9: Health Check Failure Response**
    - **Validates: Requirements 10.5**
  
  - [x] 9.5 Write unit tests for health check endpoint
    - Test all checks pass returns 200 and UP
    - Test database failure returns 503 and DOWN
    - Test JWT config failure returns 503 and DOWN
    - Test endpoint is accessible without authentication
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 10. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Enhance frontend error handling in AuthContext
  - Create extractErrorMessage helper function
  - Handle error.response?.data?.message (API errors)
  - Handle Network Error with "Unable to connect to server. Please try again."
  - Handle timeout errors with "Request timed out. Please try again."
  - Handle generic errors with fallback message
  - Update login method to use extractErrorMessage
  - Update signup method to use extractErrorMessage
  - _Requirements: 8.1, 8.2_

- [x] 11.1 Write unit tests for error message extraction
  - Test API error response extraction
  - Test network error message
  - Test timeout error message
  - Test generic error fallback
  - _Requirements: 8.1, 8.2_

- [x] 12. Enhance LoginPage with validation and error display
  - Add client-side validation before form submission
  - Check for empty email and password fields
  - Display validation errors using toast.error
  - Ensure errors are displayed using toast notifications
  - Keep user on login page when authentication fails
  - Verify demo credentials box is visible and styled appropriately
  - _Requirements: 8.1, 8.3, 8.4, 9.1, 9.2, 9.3, 9.4_

- [x] 12.1 Write unit tests for LoginPage
  - Test form validation prevents submission with empty fields
  - Test error messages display via toast
  - Test user stays on page after failed login
  - Test demo credentials are displayed
  - _Requirements: 8.3, 8.4, 9.1, 9.2, 9.3, 9.4_

- [x] 13. Final integration testing and verification
  - [x] 13.1 Test end-to-end login flow with demo user
    - Start application and verify demo user is created
    - Login with demo@aibh.com / demo1234
    - Verify successful authentication and navigation to chat
    - _Requirements: 2.1, 2.2, 5.1_
  
  - [x] 13.2 Test error scenarios
    - Test login with invalid credentials shows correct error
    - Test signup with existing email shows correct error
    - Test CORS from frontend origin works
    - Test health check endpoint is accessible
    - _Requirements: 4.1, 5.1, 5.3, 10.1, 10.6_
  
  - [x] 13.3 Verify logging output
    - Check successful login logs INFO with email
    - Check failed login logs WARN without password
    - Check initialization logs INFO message
    - Verify no passwords or tokens in any logs
    - _Requirements: 6.1, 6.2, 6.5, 6.6_
  
  - [x] 13.4 Test data persistence
    - Create a test user
    - Restart application
    - Verify test user still exists
    - Verify demo user still exists
    - _Requirements: 3.3_

- [x] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive authentication fixes
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end flows
- The implementation maintains backward compatibility with existing functionality
- All changes are additive except for configuration updates
