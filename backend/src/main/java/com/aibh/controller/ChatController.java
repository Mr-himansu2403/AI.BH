package com.aibh.controller;

import com.aibh.dto.ChatRequest;
import com.aibh.dto.ChatResponse;
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

import java.util.List;

@RestController
@RequestMapping("/aibh")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@Tag(name = "Chat", description = "AI Chat Operations")
@SecurityRequirement(name = "bearerAuth")
public class ChatController {
    
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    
    @Autowired
    private ChatService chatService;
    
    @PostMapping("/chat")
    @Operation(summary = "Send chat message", description = "Send a text message to the AI assistant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successful response"),
        @ApiResponse(responseCode = "429", description = "Rate limit exceeded"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        
        logger.info("Processing chat request for user: {}", user.getEmail());
        ChatResponse response = chatService.processChat(request, user);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/chat/image")
    @Operation(summary = "Send image with message", description = "Send an image with text message to the AI assistant")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @RequestParam String sessionId,
            @AuthenticationPrincipal UserPrincipal user) {
        
        logger.info("Retrieving chat history for user: {} and session: {}", user.getEmail(), sessionId);
        List<ChatMessage> history = chatService.getChatHistory(sessionId, user);
        return ResponseEntity.ok(history);
    }
    
    @DeleteMapping("/chat/history")
    @Operation(summary = "Clear chat history", description = "Clear chat history for a session")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> clearChatHistory(
            @RequestParam String sessionId,
            @AuthenticationPrincipal UserPrincipal user) {
        
        logger.info("Clearing chat history for user: {} and session: {}", user.getEmail(), sessionId);
        chatService.clearChatHistory(sessionId, user);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if the service is running")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("AI.BH Backend is running!");
    }
}