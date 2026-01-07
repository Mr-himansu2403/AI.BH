package com.aibh.metrics;

import com.aibh.repository.ConversationRepository;
import com.aibh.repository.UserRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ChatMetrics {
    
    private final Counter chatRequestsTotal;
    private final Counter chatRequestsSuccess;
    private final Counter chatRequestsError;
    private final Timer chatResponseTime;
    private final Counter tokensUsedTotal;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    public ChatMetrics(MeterRegistry meterRegistry) {
        this.chatRequestsTotal = Counter.builder("chat_requests_total")
            .description("Total number of chat requests")
            .register(meterRegistry);
            
        this.chatRequestsSuccess = Counter.builder("chat_requests_success_total")
            .description("Total number of successful chat requests")
            .register(meterRegistry);
            
        this.chatRequestsError = Counter.builder("chat_requests_error_total")
            .description("Total number of failed chat requests")
            .register(meterRegistry);
            
        this.chatResponseTime = Timer.builder("chat_response_time")
            .description("Chat response time in milliseconds")
            .register(meterRegistry);
            
        this.tokensUsedTotal = Counter.builder("tokens_used_total")
            .description("Total number of tokens used")
            .register(meterRegistry);
            
        // Register gauges directly without storing references
        Gauge.builder("active_users", this, ChatMetrics::getActiveUserCount)
            .description("Number of active users")
            .register(meterRegistry);
            
        Gauge.builder("active_conversations", this, ChatMetrics::getActiveConversationCount)
            .description("Number of active conversations")
            .register(meterRegistry);
    }
    
    public void incrementChatRequests() {
        chatRequestsTotal.increment();
    }
    
    public void incrementSuccessfulRequests() {
        chatRequestsSuccess.increment();
    }
    
    public void incrementErrorRequests() {
        chatRequestsError.increment();
    }
    
    public Timer.Sample startTimer() {
        return Timer.start();
    }
    
    public void recordResponseTime(Timer.Sample sample) {
        sample.stop(chatResponseTime);
    }
    
    public void recordTokensUsed(int tokens) {
        tokensUsedTotal.increment(tokens);
    }
    
    private double getActiveUserCount() {
        try {
            return userRepository.countActiveUsers();
        } catch (Exception e) {
            return 0;
        }
    }
    
    private double getActiveConversationCount() {
        try {
            return conversationRepository.count(); // All conversations
        } catch (Exception e) {
            return 0;
        }
    }
}