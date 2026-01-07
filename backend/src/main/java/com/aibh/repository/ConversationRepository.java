package com.aibh.repository;

import com.aibh.model.Conversation;
import com.aibh.model.ConversationStatus;
import com.aibh.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    Optional<Conversation> findBySessionId(String sessionId);
    
    Optional<Conversation> findByIdAndUser(Long id, User user);
    
    Optional<Conversation> findBySessionIdAndUser(String sessionId, User user);
    
    List<Conversation> findByUserAndStatusOrderByUpdatedAtDesc(User user, ConversationStatus status);
    
    Page<Conversation> findByUserAndStatusOrderByUpdatedAtDesc(User user, ConversationStatus status, Pageable pageable);
    
    @Query("SELECT c FROM Conversation c WHERE c.user = :user AND c.status = :status ORDER BY c.updatedAt DESC")
    List<Conversation> findRecentConversations(@Param("user") User user, @Param("status") ConversationStatus status, Pageable pageable);
    
    @Query("SELECT COUNT(c) FROM Conversation c WHERE c.user = :user AND c.status = :status")
    long countByUserAndStatus(@Param("user") User user, @Param("status") ConversationStatus status);
    
    void deleteByUserAndStatus(User user, ConversationStatus status);
}