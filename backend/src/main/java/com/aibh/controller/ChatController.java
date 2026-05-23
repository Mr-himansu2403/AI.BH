package com.aibh.controller;

import com.aibh.dto.ChatRequest;
import com.aibh.dto.ChatResponse;
import com.aibh.dto.ConversationSummaryResponse;
import com.aibh.model.ChatMessage;
import com.aibh.security.UserPrincipal;
import com.aibh.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/aibh")
@Tag(name = "Chat", description = "AI Chat Operations")
@SecurityRequirement(name = "bearerAuth")
public class ChatController {
    
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    
    @Autowired
    private ChatService chatService;
    
    @Autowired
    private com.aibh.service.AiService aiService;
    
    @Autowired
    private com.aibh.repository.ChatMessageRepository chatMessageRepository;
    
    @PostMapping("/chat")
    @Operation(summary = "Send chat message", description = "Send a text message to the AI assistant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successful response"),
        @ApiResponse(responseCode = "429", description = "Rate limit exceeded"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PreAuthorize("hasRole('USER') or hasRole('ENTERPRISE') or hasRole('ADMIN')")
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        
        logger.info("Processing chat request for user: {}", user.getEmail());
        try {
            ChatResponse response = chatService.processChat(request, user);
            return ResponseEntity.ok(response);
        } catch (Throwable t) {
            logger.error("Chat endpoint failed for user: {}", user.getEmail(), t);
            
            String fallbackResponse;
            if ("IMAGE".equals(request.getMessageType()) && request.getImageUrl() != null) {
                fallbackResponse = aiService.generateImageResponse(request.getMessage(), request.getImageUrl(), null);
            } else {
                fallbackResponse = aiService.generateIntelligentResponse(request.getMessage());
            }
            
            return ResponseEntity.ok(new ChatResponse(fallbackResponse, request.getSessionId()));
        }
    }

    @GetMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream chat message", description = "Stream a text message from the AI assistant using SSE")
    public Flux<ServerSentEvent<String>> streamChat(
            @RequestParam String message,
            @RequestParam(required = false) String sessionId,
            @AuthenticationPrincipal UserPrincipal user) {
        
        String userEmail = user != null ? user.getEmail() : "anonymous";
        logger.info("Streaming chat request for user: {} (Session: {})", userEmail, sessionId);

        try {
            return chatService.streamAndPersist(message, sessionId, user)
                    .map(content -> ServerSentEvent.<String>builder()
                            .data(content)
                            .build())
                    .onErrorResume(e -> {
                        logger.error("Streaming error", e);
                        return Flux.just(ServerSentEvent.<String>builder()
                                .data(aiService.generateIntelligentResponse(message))
                                .build());
                    });
        } catch (Throwable t) {
            logger.error("Streaming endpoint failed for user: {}", userEmail, t);
            return Flux.just(ServerSentEvent.<String>builder()
                    .data(aiService.generateIntelligentResponse(message))
                    .build());
        }
    }
    
    @PostMapping("/chat/image")
    @Operation(summary = "Send image with message", description = "Send an image with text message to the AI assistant")
    @PreAuthorize("hasRole('USER') or hasRole('ENTERPRISE') or hasRole('ADMIN')")
    public ResponseEntity<ChatResponse> chatWithImage(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        
        logger.info("Processing image chat request for user: {}", user.getEmail());
        request.setMessageType("IMAGE");
        ChatResponse response = chatService.processChat(request, user);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/chat/history")
    @Operation(summary = "Get chat history", description = "Retrieve chat history for a session")
    @PreAuthorize("hasRole('USER') or hasRole('ENTERPRISE') or hasRole('ADMIN')")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @RequestParam String sessionId,
            @AuthenticationPrincipal UserPrincipal user) {
        
        logger.info("Retrieving chat history for user: {} and session: {}", user.getEmail(), sessionId);
        List<ChatMessage> history = chatService.getChatHistory(sessionId, user);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/chat/conversations")
    @Operation(summary = "Get conversations", description = "Retrieve recent conversations for the authenticated user")
    @PreAuthorize("hasRole('USER') or hasRole('ENTERPRISE') or hasRole('ADMIN')")
    public ResponseEntity<List<ConversationSummaryResponse>> getConversations(
            @AuthenticationPrincipal UserPrincipal user) {

        logger.info("Retrieving conversations for user: {}", user.getEmail());
        return ResponseEntity.ok(chatService.getConversations(user));
    }
    
    @DeleteMapping("/chat/history")
    @Operation(summary = "Clear chat history", description = "Clear chat history for a session")
    @PreAuthorize("hasRole('USER') or hasRole('ENTERPRISE') or hasRole('ADMIN')")
    public ResponseEntity<Void> clearChatHistory(
            @RequestParam String sessionId,
            @AuthenticationPrincipal UserPrincipal user) {
        
        logger.info("Clearing chat history for user: {} and session: {}", user.getEmail(), sessionId);
        chatService.clearChatHistory(sessionId, user);
        return ResponseEntity.ok().build();
    }
}
