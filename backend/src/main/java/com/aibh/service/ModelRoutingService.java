package com.aibh.service;

import com.aibh.model.Intent;
import org.springframework.stereotype.Service;

/**
 * AI Model Routing Service
 *
 * Routes each request to the optimal model based on detected intent.
 *
 * Strategy:
 *   Fast models (flash / mini / haiku) → greetings, general chat, RAG summaries
 *   Powerful models (sonnet / 4o / pro) → technical, coding, academic tasks
 *   Codellama / Mistral (Ollama)        → local zero-latency fallback
 *
 * Temperature guide:
 *   0.1-0.3  → deterministic, factual (code, technical, RAG)
 *   0.5-0.7  → balanced (general conversation)
 *   0.8-0.9  → creative, varied (brainstorming, stories)
 *
 * MaxToken guide:
 *   150-300  → greetings (keep it short)
 *   600-800  → technical (concise but complete)
 *   1000+    → creative / problem-solving (needs space)
 */
@Service
public class ModelRoutingService {

    public String selectModel(Intent intent, boolean isVisionRequest) {
        return selectModel(intent, isVisionRequest, "openai");
    }

    public String selectModel(Intent intent, boolean isVisionRequest, String provider) {
        String p = provider == null ? "openai" : provider.toLowerCase();

        if (isVisionRequest) {
            return switch (p) {
                case "gemini" -> "gemini-2.0-flash";
                case "ollama" -> "llava";
                default       -> "gpt-4o";
            };
        }

        if (intent == null) {
            return defaultModelForProvider(p);
        }

        return switch (p) {
            case "anthropic" -> selectAnthropicModel(intent);
            case "gemini"    -> selectGeminiModel(intent);
            case "ollama"    -> selectOllamaModel(intent);
            default          -> selectOpenAiModel(intent);
        };
    }

    // ── OpenAI ───────────────────────────────────────────────────────────────
    private String selectOpenAiModel(Intent intent) {
        return switch (intent.getType()) {
            case "technical", "academic", "problem_solving" -> "gpt-4o";       // accuracy
            case "greeting", "general", "conversational"   -> "gpt-4o-mini";   // 4x faster, low cost
            default -> "gpt-4o-mini";
        };
    }

    // ── Gemini ────────────────────────────────────────────────────────────────
    private String selectGeminiModel(Intent intent) {
        return switch (intent.getType()) {
            case "technical", "academic", "problem_solving" -> "gemini-2.5-pro";    // deep reasoning
            case "creative", "greeting", "general",
                 "conversational", "rag"                    -> "gemini-2.0-flash";  // 4x faster
            default -> "gemini-2.0-flash";
        };
    }

    // ── Anthropic ─────────────────────────────────────────────────────────────
    private String selectAnthropicModel(Intent intent) {
        return switch (intent.getType()) {
            case "technical", "academic", "problem_solving" -> "claude-3-5-sonnet-20241022"; // best code
            case "creative"                                 -> "claude-3-sonnet-20240229";
            case "greeting", "general", "conversational"   -> "claude-3-haiku-20240307";    // 3x faster
            default -> "claude-3-haiku-20240307";
        };
    }

    // ── Ollama (local / zero-latency) ─────────────────────────────────────────
    private String selectOllamaModel(Intent intent) {
        return switch (intent.getType()) {
            case "technical", "problem_solving" -> "codellama"; // purpose-built for code
            case "academic"                     -> "llama3";    // best local reasoning
            default                             -> "mistral";   // fastest general-purpose
        };
    }

    private String defaultModelForProvider(String provider) {
        return switch (provider) {
            case "anthropic" -> "claude-3-haiku-20240307";
            case "gemini"    -> "gemini-2.0-flash";
            case "ollama"    -> "mistral";
            default          -> "gpt-4o-mini";
        };
    }

    // ── Generation Parameters ─────────────────────────────────────────────────

    /**
     * Maximum tokens to generate.
     * Tuned to prevent essay-length padding while giving complex intents enough room.
     */
    public int getMaxTokens(Intent intent) {
        if (intent == null) return 800;
        return switch (intent.getType()) {
            case "technical", "academic"  -> 800;   // concise but complete
            case "problem_solving"        -> 1000;  // needs step-by-step space
            case "creative"               -> 1200;  // needs room to breathe
            case "greeting"               -> 150;   // keep it short
            case "rag"                    -> 600;   // summarise, don't hallucinate
            default                       -> 600;
        };
    }

    /**
     * Sampling temperature.
     * Low = factual & deterministic. High = creative & varied.
     */
    public double getTemperature(Intent intent) {
        if (intent == null) return 0.7;
        return switch (intent.getType()) {
            case "technical", "academic",
                 "problem_solving"           -> 0.2;   // no hallucinations in code/facts
            case "rag"                       -> 0.3;   // stay close to retrieved context
            case "general", "conversational" -> 0.7;
            case "greeting"                  -> 0.75;
            case "creative"                  -> 0.9;   // maximum creativity
            default                          -> 0.7;
        };
    }
}