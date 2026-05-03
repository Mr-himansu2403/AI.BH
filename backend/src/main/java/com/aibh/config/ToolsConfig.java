package com.aibh.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.util.function.Function;

@Configuration
public class ToolsConfig {

    public record WeatherRequest(String city) {}
    public record WeatherResponse(String weather) {}

    @Bean
    @Description("Get the current weather for a city")
    public Function<WeatherRequest, WeatherResponse> getCurrentWeather() {
        return (request) -> {
            // In a real app, call a weather API
            return new WeatherResponse("It's currently 22°C and sunny in " + request.city());
        };
    }

    public record SearchRequest(String query) {}
    public record SearchResponse(String results) {}

    @Bean
    @Description("Search the local project codebase for a specific topic or symbol")
    public Function<SearchRequest, SearchResponse> searchCodebase() {
        return (request) -> {
            // Simulated codebase search
            return new SearchResponse("Found several references to " + request.query() + " in the service and controller packages.");
        };
    }
}