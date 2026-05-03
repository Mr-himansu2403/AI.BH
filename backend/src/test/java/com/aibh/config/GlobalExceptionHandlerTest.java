package com.aibh.config;

import com.aibh.dto.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    public void testAuthenticationFailureStatusCodes() {
        ResponseEntity<ErrorResponse> response1 = handler.handleBadCredentials(new BadCredentialsException("bad"));
        assertEquals(HttpStatus.UNAUTHORIZED, response1.getStatusCode());
        assertEquals("Invalid email or password", response1.getBody().getMessage());

        ResponseEntity<ErrorResponse> response2 = handler.handleDisabledAccount(new DisabledException("disabled"));
        assertEquals(HttpStatus.UNAUTHORIZED, response2.getStatusCode());
        assertEquals("Account is disabled", response2.getBody().getMessage());
    }

    @Test
    public void testValidationFailureStatusCodes() {
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getAllErrors()).thenReturn(Collections.emptyList());
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);
        
        ResponseEntity<ErrorResponse> response = handler.handleValidationExceptions(ex);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        
        ResponseEntity<ErrorResponse> response2 = handler.handleDataIntegrityViolation(new DataIntegrityViolationException("Email already exists"));
        assertEquals(HttpStatus.BAD_REQUEST, response2.getStatusCode());
    }

    @Test
    public void testUnexpectedErrorStatusCodes() {
        ResponseEntity<ErrorResponse> response = handler.handleGenericException(new Exception("unexpected"), null);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        
        ResponseEntity<ErrorResponse> response2 = handler.handleRuntimeException(new RuntimeException("runtime"), null);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response2.getStatusCode());
    }

    @Test
    public void testValidationErrorFieldMapping() {
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("objectName", "email", "must not be blank");
        when(bindingResult.getAllErrors()).thenReturn(Collections.singletonList(fieldError));
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);
        
        ResponseEntity<ErrorResponse> response = handler.handleValidationExceptions(ex);
        assertNotNull(response.getBody().getFieldErrors());
        assertEquals("must not be blank", response.getBody().getFieldErrors().get("email"));
    }
}
