package com.aibh.service;

import com.aibh.dto.ChatRequest;
import com.aibh.dto.ChatResponse;
import com.aibh.model.ChatMessage;
import com.aibh.model.Conversation;
import com.aibh.model.ConversationStatus;
import com.aibh.model.User;
import com.aibh.metrics.ChatMetrics;
import com.aibh.repository.ChatMessageRepository;
import com.aibh.repository.ConversationRepository;
import com.aibh.repository.UserRepository;
import com.aibh.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class ChatService {
    
    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AiService aiService;
    
    @Autowired
    private ChatMetrics chatMetrics;
    
    @Transactional
    public ChatResponse processChat(ChatRequest request, UserPrincipal userPrincipal) {
        String sessionId = request.getSessionId();
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = generateSessionId();
        }
        
        // Start metrics tracking
        chatMetrics.incrementChatRequests();
        var timerSample = chatMetrics.startTimer();
        
        try {
            // Get user entity
            Objects.requireNonNull(userPrincipal, "User authentication required");
            Long userId = Objects.requireNonNull(userPrincipal.getId(), "User ID cannot be null");
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get or create conversation
            Conversation conversation = getOrCreateConversation(sessionId, user, request.getMessage());
            
            // Get conversation history for context
            List<ChatMessage> conversationHistory = chatMessageRepository
                .findRecentBySessionIdWithLimit(sessionId, 10);
            
            long startTime = System.currentTimeMillis();
            
            // Generate AI response
            String aiResponse;
            if ("IMAGE".equals(request.getMessageType()) && request.getImageUrl() != null) {
                aiResponse = aiService.generateImageResponse(
                    request.getMessage(), 
                    request.getImageUrl(), 
                    conversationHistory
                );
            } else {
                aiResponse = aiService.generateResponse(request.getMessage(), conversationHistory);
            }
            
            long responseTime = System.currentTimeMillis() - startTime;
            
            // Save conversation to database
            ChatMessage chatMessage = new ChatMessage(
                conversation,
                user,
                request.getMessage(),
                aiResponse,
                request.getMessageType()
            );
            
            if (request.getImageUrl() != null) {
                chatMessage.setImageUrl(request.getImageUrl());
            }
            
            chatMessage.setResponseTimeMs(responseTime);
            // Estimate tokens used (rough calculation: 1 token ≈ 4 characters)
            chatMessage.setTokensUsed(estimateTokens(request.getMessage() + aiResponse));
            
            chatMessageRepository.save(chatMessage);
            
            // Update conversation title if it's the first message
            if (conversation.getMessages().isEmpty()) {
                String title = generateConversationTitle(request.getMessage());
                conversation.setTitle(title);
                conversationRepository.save(conversation);
            }
            
            logger.info("Chat processed successfully for user: {} in {}ms", 
                       userPrincipal.getEmail(), responseTime);
            
            // Record metrics
            chatMetrics.incrementSuccessfulRequests();
            chatMetrics.recordResponseTime(timerSample);
            if (chatMessage.getTokensUsed() != null) {
                chatMetrics.recordTokensUsed(chatMessage.getTokensUsed());
            }
            
            return new ChatResponse(aiResponse, sessionId);
            
        } catch (Exception e) {
            logger.error("ChatService error for user: {}", userPrincipal != null ? userPrincipal.getEmail() : "unknown", e);
            
            // Record error metrics
            chatMetrics.incrementErrorRequests();
            chatMetrics.recordResponseTime(timerSample);
            
            // Try to provide a fallback response using AiService directly
            try {
                String fallbackResponse = aiService.generateIntelligentResponse(request.getMessage());
                return new ChatResponse(fallbackResponse, sessionId);
            } catch (Exception fallbackError) {
                logger.error("Fallback also failed for user: {}", userPrincipal != null ? userPrincipal.getEmail() : "unknown", fallbackError);
                return ChatResponse.error("I apologize, but I'm experiencing technical difficulties. Please try again in a moment.");
            }
        }
    }
    
    // Backward compatibility method
    public ChatResponse processChat(ChatRequest request) {
        // For backward compatibility, create a temporary user principal
        // This should be removed once all calls are updated
        logger.warn("Using deprecated processChat method without user authentication");
        return processChat(request, null);
    }
    
    public List<ChatMessage> getChatHistory(String sessionId, UserPrincipal userPrincipal) {
        if (userPrincipal != null && userPrincipal.getId() != null) {
            // Verify user owns this session
            Long userId = Objects.requireNonNull(userPrincipal.getId(), "User ID cannot be null");
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Conversation conversation = conversationRepository.findBySessionIdAndUser(sessionId, user)
                .orElse(null);
            
            if (conversation != null) {
                return chatMessageRepository.findByConversationOrderByCreatedAtAsc(conversation);
            }
        }
        
        // Fallback to session-based lookup for backward compatibility
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }
    
    // Backward compatibility method
    public List<ChatMessage> getChatHistory(String sessionId) {
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }
    
    @Transactional
    public void clearChatHistory(String sessionId, UserPrincipal userPrincipal) {
        if (userPrincipal != null && userPrincipal.getId() != null) {
            Long userId = Objects.requireNonNull(userPrincipal.getId(), "User ID cannot be null");
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Conversation conversation = conversationRepository.findBySessionIdAndUser(sessionId, user)
                .orElse(null);
            
            if (conversation != null) {
                conversation.setStatus(ConversationStatus.DELETED);
                conversationRepository.save(conversation);
                logger.info("Conversation {} marked as deleted for user: {}", 
                           sessionId, userPrincipal.getEmail());
                return;
            }
        }
        
        // Fallback for backward compatibility
        chatMessageRepository.deleteBySessionId(sessionId);
    }
    
    // Backward compatibility method
    public void clearChatHistory(String sessionId) {
        chatMessageRepository.deleteBySessionId(sessionId);
    }
    
    private Conversation getOrCreateConversation(String sessionId, User user, String firstMessage) {
        return conversationRepository.findBySessionIdAndUser(sessionId, user)
            .orElseGet(() -> {
                Conversation conversation = new Conversation();
                conversation.setUser(user);
                conversation.setSessionId(sessionId);
                conversation.setTitle(generateConversationTitle(firstMessage));
                conversation.setStatus(ConversationStatus.ACTIVE);
                return conversationRepository.save(conversation);
            });
    }
    
    private String generateSessionId() {
        return "session_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
    
    private String generateConversationTitle(String firstMessage) {
        if (firstMessage == null || firstMessage.trim().isEmpty()) {
            return "New Conversation";
        }
        
        String title = firstMessage.trim();
        if (title.length() > 50) {
            title = title.substring(0, 47) + "...";
        }
        
        return title;
    }
    
    private int estimateTokens(String text) {
        // Rough estimation: 1 token ≈ 4 characters
        return text != null ? text.length() / 4 : 0;
    }
}