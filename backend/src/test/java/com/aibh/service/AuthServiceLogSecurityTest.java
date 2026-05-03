package com.aibh.service;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.aibh.dto.AuthRequest;
import com.aibh.repository.UserRepository;
import com.aibh.security.JwtTokenProvider;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthServiceLogSecurityTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private ListAppender<ILoggingEvent> listAppender;
    private Logger authLogger;

    @BeforeEach
    public void setup() {
        authLogger = (Logger) LoggerFactory.getLogger(AuthService.class);
        listAppender = new ListAppender<>();
        listAppender.start();
        authLogger.addAppender(listAppender);
    }

    @AfterEach
    public void teardown() {
        authLogger.detachAppender(listAppender);
    }

    @Test
    public void testLogSecurityNoSensitiveData() {
        AuthRequest request = new AuthRequest();
        request.setEmail("test@example.com");
        request.setPassword("secretPassword");

        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Invalid"));

        try {
            authService.login(request);
            fail("Expected exception");
        } catch (Exception e) {
            // expected
        }

        boolean hasLog = false;
        for (ILoggingEvent event : listAppender.list) {
            String message = event.getFormattedMessage();
            if (message.contains("test@example.com")) {
                hasLog = true;
                assertFalse(message.contains("secretPassword"), "Password should not be logged");
            }
        }
        assertTrue(hasLog, "Expected a log message for failed login");
    }
}
