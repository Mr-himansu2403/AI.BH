package com.aibh.config;

import org.springframework.ai.embedding.EmbeddingClient;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;

@Configuration
public class VectorStoreConfig {

    @Value("${spring.ai.vectorstore.simple.file-path:data/vectorstore.json}")
    private String vectorStorePath;

    @Bean
    @ConditionalOnBean(name = "openAiEmbeddingClient")
    public VectorStore openAiVectorStore(@org.springframework.beans.factory.annotation.Qualifier("openAiEmbeddingClient") EmbeddingClient embeddingClient) {
        return createVectorStore(embeddingClient);
    }

    @Bean
    @ConditionalOnMissingBean(VectorStore.class)
    @ConditionalOnBean(name = "ollamaEmbeddingClient")
    public VectorStore ollamaVectorStore(@org.springframework.beans.factory.annotation.Qualifier("ollamaEmbeddingClient") EmbeddingClient embeddingClient) {
        return createVectorStore(embeddingClient);
    }

    private VectorStore createVectorStore(EmbeddingClient embeddingClient) {
        SimpleVectorStore vectorStore = new SimpleVectorStore(embeddingClient);
        File vectorStoreFile = new File(vectorStorePath);
        if (vectorStoreFile.exists()) {
            vectorStore.load(vectorStoreFile);
        }
        return vectorStore;
    }
}
