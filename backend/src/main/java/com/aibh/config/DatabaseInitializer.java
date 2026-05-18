package com.aibh.config;

import com.aibh.model.Role;
import com.aibh.model.User;
import com.aibh.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements ApplicationRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(ApplicationArguments args) {
        try {
            initializeDemoUser();
            initializeAdminUser();
        } catch (Exception e) {
            logger.error("Database initialization failed, but application will continue", e);
        }
    }
    
    private void initializeDemoUser() {
        String demoEmail = "demo@aibh.com";
        
        try {
            // Check if demo user already exists
            if (userRepository.existsByEmail(demoEmail)) {
                logger.info("Demo user already exists, skipping initialization");
                return;
            }
            
            // Create demo user
            User demoUser = new User();
            demoUser.setEmail(demoEmail);
            demoUser.setPassword(passwordEncoder.encode("demo1234"));
            demoUser.setFirstName("Demo");
            demoUser.setLastName("User");
            demoUser.setRole(Role.USER);
            demoUser.setEnabled(true);
            
            userRepository.save(demoUser);
            logger.info("Demo user created successfully: {}", demoEmail);
            
        } catch (Exception e) {
            logger.error("Failed to create demo user", e);
        }
    }

    private void initializeAdminUser() {
        String adminEmail = "himansu@gmail.com";
        
        try {
            if (userRepository.existsByEmail(adminEmail)) {
                logger.info("Admin user already exists, updating password to ensure it is correct");
                User existingAdmin = userRepository.findByEmail(adminEmail).orElseThrow();
                existingAdmin.setPassword(passwordEncoder.encode("2421"));
                existingAdmin.setRole(Role.ADMIN);
                existingAdmin.setEnabled(true);
                userRepository.save(existingAdmin);
                logger.info("Admin user updated successfully: {}", adminEmail);
                return;
            }
            
            User adminUser = new User();
            adminUser.setEmail(adminEmail);
            adminUser.setPassword(passwordEncoder.encode("2421"));
            adminUser.setFirstName("Himansu");
            adminUser.setLastName("Admin");
            adminUser.setRole(Role.ADMIN);
            adminUser.setEnabled(true);
            
            userRepository.save(adminUser);
            logger.info("Admin user created successfully: {}", adminEmail);
            
        } catch (Exception e) {
            logger.error("Failed to create/update admin user", e);
        }
    }
}
