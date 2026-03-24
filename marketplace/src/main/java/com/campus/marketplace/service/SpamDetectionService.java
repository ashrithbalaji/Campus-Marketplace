package com.campus.marketplace.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class SpamDetectionService {

    // Common spam keywords
    private static final List<String> SPAM_KEYWORDS = Arrays.asList(
            "lottery", "casino", "free money", "get rich quick", "click here", "subscribe now"
    );

    /**
     * Validates the product text for spam rules.
     * Throws an IllegalArgumentException if spam is detected.
     */
    public void validateProductContent(String name, String description) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Product name cannot be empty.");
        }
        
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Product description cannot be empty.");
        }

        String lowerCaseDesc = description.toLowerCase();

        // 1. Rule: Reject descriptions containing HTTP/HTTPS links
        if (lowerCaseDesc.contains("http://") || lowerCaseDesc.contains("https://")) {
            throw new IllegalArgumentException("Spam Detected: External links are not allowed in product descriptions.");
        }

        // 2. Rule: Reject very short text
        if (description.trim().length() < 10) {
            throw new IllegalArgumentException("Spam Detected: Product description is too short. Please provide more details.");
        }

        // 3. Rule: Reject suspicious keywords
        for (String keyword : SPAM_KEYWORDS) {
            if (lowerCaseDesc.contains(keyword)) {
                throw new IllegalArgumentException("Spam Detected: Description contains prohibited keywords.");
            }
        }
        
        // 4. Rule: Reject repeated nonsense (e.g., "aaaaaaaaaa")
        if (isRepeatedText(description.trim())) {
            throw new IllegalArgumentException("Spam Detected: Description contains excessive repeated characters.");
        }
    }

    private boolean isRepeatedText(String text) {
        if (text.length() > 20) {
            // Count maximum consecutively repeated characters
            int maxConsecutive = 1;
            int currentConsecutive = 1;
            char lastChar = text.charAt(0);
            
            for (int i = 1; i < text.length(); i++) {
                if (text.charAt(i) == lastChar) {
                    currentConsecutive++;
                    if (currentConsecutive > maxConsecutive) {
                        maxConsecutive = currentConsecutive;
                    }
                } else {
                    currentConsecutive = 1;
                    lastChar = text.charAt(i);
                }
            }
            
            // If the same exact character is repeated more than 15 times consecutively, flag as spam
            return maxConsecutive > 15;
        }
        return false;
    }
}
