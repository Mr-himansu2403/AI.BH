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

import java.util.Optional;

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
        // Mock demo user as missing
        when(userRepository.existsByEmail("demo@aibh.com")).thenReturn(false);
        // Mock admin user as already existing to avoid second save() call in this test
        when(userRepository.existsByEmail("himansu@gmail.com")).thenReturn(true);
        when(userRepository.findByEmail("himansu@gmail.com")).thenReturn(Optional.of(new User()));
        
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");

        initializer.run(new DefaultApplicationArguments());

        // Capture all save calls
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, atLeastOnce()).save(userCaptor.capture());

        // Check if demo user was among the saved users
        User savedDemoUser = userCaptor.getAllValues().stream()
                .filter(u -> "demo@aibh.com".equals(u.getEmail()))
                .findFirst()
                .orElseThrow();
                
        assertEquals("encodedPassword", savedDemoUser.getPassword());
        assertEquals("Demo", savedDemoUser.getFirstName());
        assertEquals("User", savedDemoUser.getLastName());
        assertEquals(Role.USER, savedDemoUser.getRole());
        assertTrue(savedDemoUser.getEnabled());
    }

    @Test
    public void testDatabaseInitializationIdempotence() {
        // Mock both as existing
        when(userRepository.existsByEmail("demo@aibh.com")).thenReturn(true);
        when(userRepository.existsByEmail("himansu@gmail.com")).thenReturn(true);
        // For existing admin, it updates password, so it still calls save()
        when(userRepository.findByEmail("himansu@gmail.com")).thenReturn(Optional.of(new User()));
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");

        initializer.run(new DefaultApplicationArguments());

        // Should call save once for admin update, but never for demo
        verify(userRepository, atLeastOnce()).save(any());
        
        // Specifically check that no NEW demo user was saved
        verify(userRepository, never()).save(argThat(u -> u != null && "Demo".equals(u.getFirstName())));
    }

    @Test
    public void testInitializationErrorHandling() {
        when(userRepository.existsByEmail("demo@aibh.com")).thenThrow(new RuntimeException("DB Error"));

        assertDoesNotThrow(() -> {
            initializer.run(new DefaultApplicationArguments());
        });
    }
}
