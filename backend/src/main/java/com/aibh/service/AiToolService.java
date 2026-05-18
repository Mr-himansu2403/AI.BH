package com.aibh.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * AI Tool Service — Spring AI Function Calling / MCP-style Tool Use
 *
 * Reference: Claude MCP tools, ChatGPT tool_calls
 *
 * Implemented Tools:
 *   1. get_current_datetime — Returns current date and time
 *   2. web_search           — DuckDuckGo Instant Answer API (free, no key needed)
 *   3. calculate            — Safe math expression evaluator
 *   4. get_weather          — Open-Meteo API (free, no key needed)
 *
 * Usage: AiService detects tool-call intent in the prompt and calls these
 *        methods before sending context-enriched prompt to the AI model.
 */
@Service
public class AiToolService {

    private static final Logger logger = LoggerFactory.getLogger(AiToolService.class);

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── Tool 1: Current Date/Time ────────────────────────────────────────────
    public String getCurrentDateTime() {
        String now = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' HH:mm:ss"));
        logger.info("🔧 [Tool] get_current_datetime → {}", now);
        return now;
    }

    // ── Tool 2: Web Search (DuckDuckGo Instant Answers — no API key) ─────────
    public String webSearch(String query) {
        logger.info("🔧 [Tool] web_search → \"{}\"", query);
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://api.duckduckgo.com/")
                    .queryParam("q", query)
                    .queryParam("format", "json")
                    .queryParam("no_html", "1")
                    .queryParam("skip_disambig", "1")
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "AI.BH/1.0 (Educational AI Assistant)");

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), String.class);

            JsonNode root = objectMapper.readTree(response.getBody());

            // AbstractText is a short summary paragraph from Wikipedia/InfoBoxes
            String abstractText = root.path("AbstractText").asText();
            if (!abstractText.isBlank()) {
                String source = root.path("AbstractSource").asText("DuckDuckGo");
                return String.format("Search result for \"%s\" (via %s):\n%s", query, source, abstractText);
            }

            // Try related topics
            JsonNode topics = root.path("RelatedTopics");
            if (topics.isArray() && topics.size() > 0) {
                StringBuilder sb = new StringBuilder();
                sb.append("Search results for \"").append(query).append("\":\n");
                for (int i = 0; i < Math.min(3, topics.size()); i++) {
                    String text = topics.get(i).path("Text").asText();
                    if (!text.isBlank()) sb.append("• ").append(text).append("\n");
                }
                return sb.toString().trim();
            }

            return "No instant answer found for: " + query + ". Try rephrasing the query.";

        } catch (Exception e) {
            logger.warn("🔧 [Tool] web_search failed: {}", e.getMessage());
            return "Web search temporarily unavailable. Error: " + e.getMessage();
        }
    }

    // ── Tool 3: Safe Calculator ───────────────────────────────────────────────
    public String calculate(String expression) {
        logger.info("🔧 [Tool] calculate → \"{}\"", expression);
        try {
            // Sanitize: only allow numbers, operators, parentheses, and dot
            String sanitized = expression.replaceAll("[^0-9+\\-*/().% ]", "").trim();
            if (sanitized.isEmpty()) {
                return "Invalid expression: " + expression;
            }

            // Use JavaScript engine for safe expression evaluation
            javax.script.ScriptEngine engine =
                    new javax.script.ScriptEngineManager().getEngineByName("JavaScript");
            if (engine == null) {
                // Fallback: basic arithmetic only
                return evaluateSimpleMath(sanitized);
            }
            Object result = engine.eval(sanitized);
            return expression + " = " + result;
        } catch (Exception e) {
            return "Could not evaluate: " + expression + " (" + e.getMessage() + ")";
        }
    }

    private String evaluateSimpleMath(String expr) {
        // Very basic fallback for simple additions
        try {
            String[] parts = expr.split("\\+");
            if (parts.length == 2) {
                double a = Double.parseDouble(parts[0].trim());
                double b = Double.parseDouble(parts[1].trim());
                return expr + " = " + (a + b);
            }
        } catch (Exception ignored) {}
        return "Expression: " + expr + " (complex expression — use a dedicated calculator)";
    }

    // ── Tool 4: Weather (Open-Meteo — free, no key) ──────────────────────────
    public String getWeather(String city) {
        logger.info("🔧 [Tool] get_weather → \"{}\"", city);
        try {
            // Step 1: Geocode city to lat/lng using Open-Meteo's geocoding API
            String geocodeUrl = UriComponentsBuilder
                    .fromHttpUrl("https://geocoding-api.open-meteo.com/v1/search")
                    .queryParam("name", city)
                    .queryParam("count", "1")
                    .toUriString();

            String geocodeBody = restTemplate.getForObject(geocodeUrl, String.class);
            JsonNode geoRoot = objectMapper.readTree(geocodeBody);
            JsonNode geoResults = geoRoot.path("results");

            if (!geoResults.isArray() || geoResults.isEmpty()) {
                return "Could not find location: " + city;
            }

            double lat = geoResults.get(0).path("latitude").asDouble();
            double lon = geoResults.get(0).path("longitude").asDouble();
            String cityName = geoResults.get(0).path("name").asText(city);
            String country = geoResults.get(0).path("country").asText("");

            // Step 2: Get weather for coordinates
            String weatherUrl = UriComponentsBuilder
                    .fromHttpUrl("https://api.open-meteo.com/v1/forecast")
                    .queryParam("latitude", lat)
                    .queryParam("longitude", lon)
                    .queryParam("current_weather", "true")
                    .queryParam("hourly", "temperature_2m,precipitation_probability,windspeed_10m")
                    .toUriString();

            String weatherBody = restTemplate.getForObject(weatherUrl, String.class);
            JsonNode weatherRoot = objectMapper.readTree(weatherBody);
            JsonNode current = weatherRoot.path("current_weather");

            double temp = current.path("temperature").asDouble();
            double windspeed = current.path("windspeed").asDouble();
            int weathercode = current.path("weathercode").asInt();

            String condition = interpretWeatherCode(weathercode);

            return String.format(
                "🌍 Weather in %s, %s:\n" +
                "• Condition: %s\n" +
                "• Temperature: %.1f°C\n" +
                "• Wind Speed: %.1f km/h\n" +
                "(Source: Open-Meteo — data may have ~1hr delay)",
                cityName, country, condition, temp, windspeed
            );

        } catch (Exception e) {
            logger.warn("🔧 [Tool] get_weather failed: {}", e.getMessage());
            return "Weather data unavailable for " + city + ". Error: " + e.getMessage();
        }
    }

    private String interpretWeatherCode(int code) {
        if (code == 0)           return "Clear sky ☀️";
        if (code <= 3)           return "Partly cloudy ⛅";
        if (code <= 48)          return "Foggy 🌫️";
        if (code <= 67)          return "Rainy 🌧️";
        if (code <= 77)          return "Snowy ❄️";
        if (code <= 82)          return "Rain showers 🌦️";
        if (code <= 86)          return "Snow showers 🌨️";
        if (code >= 95)          return "Thunderstorm ⛈️";
        return "Unknown (" + code + ")";
    }

    // ── Tool Detection ────────────────────────────────────────────────────────

    /**
     * Detects if a user message requires a tool call and executes it.
     * Returns tool result to inject as context, or null if no tool needed.
     */
    public String detectAndExecuteTool(String userMessage) {
        String lower = userMessage.toLowerCase();

        // Date/Time tool
        if (lower.contains("what time") || lower.contains("what date")
                || lower.contains("current time") || lower.contains("today's date")
                || lower.contains("what day is") || lower.contains("current date")) {
            return "TOOL RESULT [get_current_datetime]:\n" + getCurrentDateTime();
        }

        // Calculator tool
        if ((lower.contains("calculate") || lower.contains("what is ")
                || lower.contains("how much is") || lower.contains("compute"))
                && lower.matches(".*[0-9].*[+\\-*/].*[0-9].*")) {
            String expr = userMessage.replaceAll("[^0-9+\\-*/().% ]", "").trim();
            if (!expr.isEmpty()) {
                return "TOOL RESULT [calculate]:\n" + calculate(expr);
            }
        }

        // Weather tool
        if (lower.contains("weather") || lower.contains("temperature in")
                || lower.contains("how hot") || lower.contains("how cold")
                || lower.contains("raining in") || lower.contains("climate in")) {
            String city = extractCity(userMessage);
            if (city != null) {
                return "TOOL RESULT [get_weather]:\n" + getWeather(city);
            }
        }

        // Web Search tool (catch-all for real-time knowledge questions)
        if (lower.contains("latest") || lower.contains("recent")
                || lower.contains("news about") || lower.contains("who is ")
                || lower.contains("what is ") || lower.contains("tell me about")
                || lower.contains("search for") || lower.contains("look up")) {
            return "TOOL RESULT [web_search]:\n" + webSearch(userMessage);
        }

        return null; // No tool matched — let the AI answer directly
    }

    private String extractCity(String message) {
        // Simple heuristic: word after "in", "at", "for", or "weather" keyword
        String lower = message.toLowerCase();
        String[] markers = {"weather in ", "weather at ", "weather for ", "temperature in ",
                            "raining in ", "climate in ", "how hot in ", "how cold in "};
        for (String marker : markers) {
            int idx = lower.indexOf(marker);
            if (idx >= 0) {
                String rest = message.substring(idx + marker.length()).trim();
                // Take first 1-3 words as city name
                String[] words = rest.split("\\s+");
                StringBuilder city = new StringBuilder();
                for (int i = 0; i < Math.min(2, words.length); i++) {
                    String w = words[i].replaceAll("[^a-zA-Z\\s-]", "");
                    if (!w.isEmpty()) city.append(w).append(" ");
                }
                return city.toString().trim();
            }
        }
        return null;
    }
}
