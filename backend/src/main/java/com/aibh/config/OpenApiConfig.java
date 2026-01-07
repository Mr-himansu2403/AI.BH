package com.aibh.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {
    
    @Value("${server.servlet.context-path:/api}")
    private String contextPath;
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("AI.BH Enterprise API")
                .version("2.0.0")
                .description("Enterprise AI Assistant Platform API with authentication, rate limiting, and monitoring")
                .contact(new Contact()
                    .name("AI.BH Development Team")
                    .email("support@aibh.com")
                    .url("https://github.com/aibh/ai-assistant"))
                .license(new License()
                    .name("MIT License")
                    .url("https://opensource.org/licenses/MIT")))
            .servers(List.of(
                new Server().url("http://localhost:8080" + contextPath).description("Development Server"),
                new Server().url("https://api.aibh.com" + contextPath).description("Production Server")
            ))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth", 
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("JWT Authentication")));
    }
    
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
            .group("public")
            .displayName("Public APIs")
            .pathsToMatch("/auth/**", "/aibh/health")
            .build();
    }
    
    @Bean
    public GroupedOpenApi chatApi() {
        return GroupedOpenApi.builder()
            .group("chat")
            .displayName("Chat APIs")
            .pathsToMatch("/aibh/chat/**")
            .build();
    }
    
    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
            .group("admin")
            .displayName("Admin APIs")
            .pathsToMatch("/actuator/**")
            .build();
    }
}