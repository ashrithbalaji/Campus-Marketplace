package com.campus.marketplace.service;

import com.campus.marketplace.model.Message;
import com.campus.marketplace.model.Product;
import com.campus.marketplace.model.User;
import com.campus.marketplace.repository.MessageRepository;
import com.campus.marketplace.repository.ProductRepository;
import com.campus.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public Message sendMessage(Long senderId, Long receiverId, Long productId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setProduct(product);
        message.setContent(content);

        return messageRepository.save(message);
    }

    public List<Message> getMessagesForProduct(Long productId) {
        return messageRepository.findByProductIdOrderByTimestampAsc(productId);
    }

    public List<Message> getMessagesBetweenUsersForProduct(Long userId, Long productId) {
        return messageRepository.findByUserAndProduct(userId, productId);
    }

    public Long getUnreadMessageCount(Long userId) {
        return messageRepository.countUnreadMessages(userId);
    }

    public void markMessagesAsRead(Long userId, Long productId) {
        List<Message> unreadMessages = messageRepository.findByReceiverIdAndReadFalse(userId);
        for (Message message : unreadMessages) {
            if (message.getProduct().getId().equals(productId)) {
                message.setRead(true);
                messageRepository.save(message);
            }
        }
    }
}