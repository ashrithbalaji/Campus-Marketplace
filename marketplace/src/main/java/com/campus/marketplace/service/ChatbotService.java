package com.campus.marketplace.service;

import org.springframework.stereotype.Service;

@Service
public class ChatbotService {

    public String getChatResponse(String userMessage) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "I didn't quite catch that. How can I help you today?";
        }

        String input = userMessage.toLowerCase().trim();

        // Rule 1: Posting or Adding a product
        if (input.contains("post") || input.contains("add") || input.contains("sell") || input.contains("upload")) {
            return "To sell an item, navigate to the 'Your Listings' page from the sidebar and click the 'Add New Listing' button. You can upload up to 10 photos!";
        }

        // Rule 2: Buying or Requesting
        if (input.contains("buy") || input.contains("purchase") || input.contains("request") || input.contains("order")) {
            return "To buy an item, browse the Marketplace, click on a product you like, and hit the green 'Request to Buy' button at the bottom of the details page.";
        }

        // Rule 3: Suggestions or Recommendations
        if (input.contains("suggest") || input.contains("recommend") || input.contains("similar")) {
            return "I recommend checking out our different categories like Electronics, Books, or Furniture. If you click on an item, I'll even show you similar products automatically at the bottom!";
        }

        // Rule 4: Spam or safety rules
        if (input.contains("spam") || input.contains("scam") || input.contains("rules")) {
            return "We keep the marketplace safe using an AI strict spam detection system. Listings with suspicious keywords, external links, or gibberish are blocked automatically.";
        }
        
        // Rule 5: Greetings
        if (input.equals("hi") || input.equals("hello") || input.contains("hey")) {
            return "Hello! I am your AI campus assistant. Ask me how to post products, how to buy, or what to look for!";
        }

        // Fallback
        return "I'm a simple rule-based AI. I can help you with questions like 'How to post a product?', 'How to buy?', or 'Suggest products'.";
    }
}
