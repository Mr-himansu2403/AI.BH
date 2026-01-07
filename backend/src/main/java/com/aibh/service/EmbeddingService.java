package com.aibh.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Enterprise Embedding Service for AI Memory System
 * Supports OpenAI Embeddings with fallback to local embeddings
 */
@Service
public class EmbeddingService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmbeddingService.class);
    
    @Value("${openai.api.key:}")
    private String openaiApiKey;
    
    @Value("${openai.embedding.url:https://api.openai.com/v1/embeddings}")
    private String embeddingUrl;
    
    @Value("${openai.embedding.model:text-embedding-3-small}")
    private String embeddingModel;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public EmbeddingService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }
    
    /**
     * Generate embeddings for text using OpenAI API
     * Falls back to simple hash-based embeddings if API unavailable
     */
    public float[] generateEmbedding(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new float[1536]; // Return zero vector
        }
        
        try {
            if (openaiApiKey != null && !openaiApiKey.isEmpty()) {
                return generateOpenAIEmbedding(text);
            } else {
                logger.warn("OpenAI API key not configured, using fallback embeddings");
                return generateFallbackEmbedding(text);
            }
        } catch (Exception e) {
            logger.error("Error generating embedding, falling back to simple embedding: {}", e.getMessage());
            return generateFallbackEmbedding(text);
        }
    }
    
    /**
     * Generate embeddings using OpenAI API
     */
    private float[] generateOpenAIEmbedding(String text) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);
        
        Map<String, Object> requestBody = Map.of(
            "input", text,
            "model", embeddingModel
        );
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        ResponseEntity<String> response = restTemplate.postForEntity(embeddingUrl, request, String.class);
        
        if (response.getStatusCode() == HttpStatus.OK) {
            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            JsonNode embeddingArray = jsonResponse.path("data").get(0).path("embedding");
            
            float[] embedding = new float[embeddingArray.size()];
            for (int i = 0; i < embeddingArray.size(); i++) {
                embedding[i] = (float) embeddingArray.get(i).asDouble();
            }
            
            logger.debug("Generated OpenAI embedding with {} dimensions", embedding.length);
            return embedding;
        } else {
            throw new RuntimeException("OpenAI API returned status: " + response.getStatusCode());
        }
    }
    
    /**
     * Fallback embedding generation using text features
     * Creates a 1536-dimensional vector based on text characteristics
     */
    private float[] generateFallbackEmbedding(String text) {
        float[] embedding = new float[1536];
        
        // Normalize text
        String normalizedText = text.toLowerCase().trim();
        
        // Feature extraction
        int textLength = normalizedText.length();
        int wordCount = normalizedText.split("\\s+").length;
        int uniqueChars = (int) normalizedText.chars().distinct().count();
        
        // Programming language detection
        boolean hasJava = normalizedText.contains("java") || normalizedText.contains("spring");
        boolean hasPython = normalizedText.contains("python") || normalizedText.contains("django");
        boolean hasJavaScript = normalizedText.contains("javascript") || normalizedText.contains("react");
        
        // Topic detection
        boolean isTechnical = normalizedText.matches(".*\\b(code|function|class|method|api|database)\\b.*");
        boolean isQuestion = normalizedText.contains("?") || normalizedText.startsWith("how") || normalizedText.startsWith("what");
        
        // Fill embedding vector with features
        embedding[0] = Math.min(textLength / 1000.0f, 1.0f); // Text length feature
        embedding[1] = Math.min(wordCount / 100.0f, 1.0f);   // Word count feature
        embedding[2] = Math.min(uniqueChars / 50.0f, 1.0f);  // Vocabulary richness
        
        // Language features
        embedding[10] = hasJava ? 1.0f : 0.0f;
        embedding[11] = hasPython ? 1.0f : 0.0f;
        embedding[12] = hasJavaScript ? 1.0f : 0.0f;
        
        // Content type features
        embedding[20] = isTechnical ? 1.0f : 0.0f;
        embedding[21] = isQuestion ? 1.0f : 0.0f;
        
        // Hash-based features for semantic similarity
        int hash = normalizedText.hashCode();
        for (int i = 50; i < 100; i++) {
            embedding[i] = ((hash >> (i - 50)) & 1) == 1 ? 0.1f : -0.1f;
        }
        
        // Normalize the vector
        float norm = 0.0f;
        for (float value : embedding) {
            norm += value * value;
        }
        norm = (float) Math.sqrt(norm);
        
        if (norm > 0) {
            for (int i = 0; i < embedding.length; i++) {
                embedding[i] /= norm;
            }
        }
        
        logger.debug("Generated fallback embedding for text: '{}'", 
                    text.length() > 50 ? text.substring(0, 50) + "..." : text);
        
        return embedding;
    }
    
    /**
     * Calculate cosine similarity between two embeddings
     */
    public double calculateSimilarity(float[] embedding1, float[] embedding2) {
        if (embedding1.length != embedding2.length) {
            throw new IllegalArgumentException("Embeddings must have the same dimension");
        }
        
        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;
        
        for (int i = 0; i < embedding1.length; i++) {
            dotProduct += embedding1[i] * embedding2[i];
            norm1 += embedding1[i] * embedding1[i];
            norm2 += embedding2[i] * embedding2[i];
        }
        
        if (norm1 == 0.0 || norm2 == 0.0) {
            return 0.0;
        }
        
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
    
    /**
     * Batch generate embeddings for multiple texts
     */
    public List<float[]> generateBatchEmbeddings(List<String> texts) {
        return texts.stream()
                   .map(this::generateEmbedding)
                   .toList();
    }
}