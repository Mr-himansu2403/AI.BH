package com.aibh.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class RateLimitingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testAnonymousRateLimiting() throws Exception {
        String testIp = "192.168.100.1";
        String loginPayload = "{\"email\":\"test@aibh.com\",\"password\":\"password\"}";
        
        // ANONYMOUS capacity is 10. Make 10 requests.
        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post("/api/aibh/auth/login")
                   .contentType(MediaType.APPLICATION_JSON)
                   .content(loginPayload)
                   .header("X-Forwarded-For", testIp))
                   // Status will likely be 401 Unauthorized, but definitely not 429
                   .andExpect(result -> assertNotEquals(429, result.getResponse().getStatus()));
        }
        
        // 11th request should be rate limited (429)
        mockMvc.perform(post("/api/aibh/auth/login")
               .contentType(MediaType.APPLICATION_JSON)
               .content(loginPayload)
               .header("X-Forwarded-For", testIp))
               .andExpect(status().isTooManyRequests());
    }
}
