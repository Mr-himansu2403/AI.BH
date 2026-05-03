package com.aibh.repository;

import com.aibh.model.Conversation;
import com.aibh.model.ConversationStatus;
import com.aibh.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    Optional<Conversation> findBySessionId(String sessionId);
    
    List<Conversation> findByUserIdAndStatus(Long userId, ConversationStatus status);
    
    @Query("SELECT c FROM Conversation c WHERE c.sessionId = ?1 AND c.deletedAt IS NULL")
    Optional<Conversation> findActiveBySessionId(String sessionId);
    
    @Query("SELECT c FROM Conversation c WHERE c.user.id = ?1 AND c.deletedAt IS NULL ORDER BY c.updatedAt DESC")
    List<Conversation> findActiveByUserId(Long userId);
    
    @Query("SELECT c FROM Conversation c WHERE c.sessionId = ?1 AND c.user = ?2 AND c.deletedAt IS NULL")
    Optional<Conversation> findBySessionIdAndUser(String sessionId, User user);
    
    @Query("SELECT COUNT(c) FROM Conversation c WHERE c.status = 'ACTIVE' AND c.deletedAt IS NULL")
    long countActiveConversations();
}