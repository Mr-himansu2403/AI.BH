package com.aibh.repository;

import com.aibh.model.ChatMessage;
import com.aibh.model.Conversation;
import com.aibh.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // Backward compatibility methods
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    
    @Query("SELECT c FROM ChatMessage c WHERE c.sessionId = :sessionId ORDER BY c.createdAt DESC")
    List<ChatMessage> findRecentBySessionId(@Param("sessionId") String sessionId);
    
    @Query(value = "SELECT * FROM chat_messages WHERE session_id = :sessionId ORDER BY created_at DESC LIMIT :limit", 
           nativeQuery = true)
    List<ChatMessage> findRecentBySessionIdWithLimit(@Param("sessionId") String sessionId, @Param("limit") int limit);
    
    void deleteBySessionId(String sessionId);
    
    // New conversation-based methods
    List<ChatMessage> findByConversationOrderByCreatedAtAsc(Conversation conversation);
    
    List<ChatMessage> findByConversationOrderByCreatedAtDesc(Conversation conversation, Pageable pageable);
    
    @Query("SELECT c FROM ChatMessage c WHERE c.conversation = :conversation ORDER BY c.createdAt DESC")
    List<ChatMessage> findRecentByConversation(@Param("conversation") Conversation conversation, Pageable pageable);
    
    @Query("SELECT c FROM ChatMessage c WHERE c.user = :user ORDER BY c.createdAt DESC")
    List<ChatMessage> findRecentByUser(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT COUNT(c) FROM ChatMessage c WHERE c.conversation = :conversation")
    long countByConversation(@Param("conversation") Conversation conversation);
    
    @Query("SELECT COUNT(c) FROM ChatMessage c WHERE c.user = :user")
    long countByUser(@Param("user") User user);
    
    void deleteByConversation(Conversation conversation);
    
    void deleteByUser(User user);
}