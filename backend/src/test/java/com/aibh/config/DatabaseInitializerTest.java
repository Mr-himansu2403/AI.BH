package com.aibh.config;

import com.aibh.model.Role;
import com.aibh.model.User;
import com.aibh.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DatabaseInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DatabaseInitializer initializer;

    @Test
    public void testDemoUserCreation() {
        when(userRepository.existsByEmail("demo@aibh.com")).thenReturn(false);
        when(passwordEncoder.encode("demo1234")).thenReturn("encodedPassword");

        initializer.run(new DefaultApplicationArguments());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("demo@aibh.com", savedUser.getEmail());
        assertEquals("encodedPassword", savedUser.getPassword());
        assertEquals("Demo", savedUser.getFirstName());
        assertEquals("User", savedUser.getLastName());
        assertEquals(Role.USER, savedUser.getRole());
        assertTrue(savedUser.getEnabled());
    }

    @Test
    public void testDatabaseInitializationIdempotence() {
        when(userRepository.existsByEmail("demo@aibh.com")).thenReturn(true);

        initializer.run(new DefaultApplicationArguments());

        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    public void testInitializationErrorHandling() {
        when(userRepository.existsByEmail("demo@aibh.com")).thenThrow(new RuntimeException("DB Error"));

        assertDoesNotThrow(() -> {
            initializer.run(new DefaultApplicationArguments());
        });
    }
}
