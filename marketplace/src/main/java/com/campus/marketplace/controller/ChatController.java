package com.campus.marketplace.controller;

import com.campus.marketplace.dto.ChatRequest;
import com.campus.marketplace.dto.ChatResponse;
import com.campus.marketplace.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChatController {

    private final ChatbotService chatbotService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String botResponse = chatbotService.getChatResponse(request.getMessage());
        return ResponseEntity.ok(new ChatResponse(botResponse));
    }
}
