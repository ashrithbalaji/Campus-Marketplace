package com.campus.marketplace.repository;

import com.campus.marketplace.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByProductIdOrderByTimestampAsc(Long productId);

    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId OR m.receiver.id = :userId) AND m.product.id = :productId ORDER BY m.timestamp ASC")
    List<Message> findByUserAndProduct(@Param("userId") Long userId, @Param("productId") Long productId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.read = false")
    Long countUnreadMessages(@Param("userId") Long userId);

    List<Message> findByReceiverIdAndReadFalse(Long receiverId);
}