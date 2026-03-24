package com.campus.marketplace.controller;

import com.campus.marketplace.model.Message;
import com.campus.marketplace.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<Message> sendMessage(
            @RequestParam Long senderId,
            @RequestParam Long receiverId,
            @RequestParam Long productId,
            @RequestBody Map<String, String> requestBody) {
        try {
            String content = requestBody.get("content");
            Message message = messageService.sendMessage(senderId, receiverId, productId, content);
            return new ResponseEntity<>(message, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Message>> getMessagesForProduct(@PathVariable Long productId) {
        return new ResponseEntity<>(messageService.getMessagesForProduct(productId), HttpStatus.OK);
    }

    @GetMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<List<Message>> getMessagesBetweenUsersForProduct(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        return new ResponseEntity<>(messageService.getMessagesBetweenUsersForProduct(userId, productId), HttpStatus.OK);
    }

    @GetMapping("/unread/{userId}")
    public ResponseEntity<Long> getUnreadMessageCount(@PathVariable Long userId) {
        return new ResponseEntity<>(messageService.getUnreadMessageCount(userId), HttpStatus.OK);
    }

    @PutMapping("/read/{userId}/product/{productId}")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        messageService.markMessagesAsRead(userId, productId);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}