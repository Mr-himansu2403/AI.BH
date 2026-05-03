package com.aibh.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(properties = "spring.ai.openai.api-key=dummy-key")
public class DatabasePersistenceTest {

    @Autowired
    private Environment env;

    @Test
    public void testDataPersistenceAcrossRestarts() {
        // Property 2: Data Persistence Across Restarts
        // Verify that the datasource URL points to a file and not an in-memory db
        String datasourceUrl = env.getProperty("spring.datasource.url", "");
        
        if (datasourceUrl.contains("h2")) {
            assertTrue(datasourceUrl.contains("file:") || !datasourceUrl.contains("mem:"),
                    "Datasource URL should be file-based for persistence across restarts");
        }
        
        String ddlAuto = env.getProperty("spring.jpa.hibernate.ddl-auto", "");
        assertEquals("update", ddlAuto, "DDL auto should be set to update to preserve data");
    }
}
