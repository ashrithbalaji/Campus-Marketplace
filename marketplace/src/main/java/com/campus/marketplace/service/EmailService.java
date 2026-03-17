package com.campus.marketplace.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public void sendOTP(String toEmail, String otp) {
        // In local development without a real SMTP server configured in application.properties,
        // attempting to send via JavaMailSender will throw an exception.
        // We will print the OTP clearly to the console for testing purposes.
        System.out.println("===============================");
        System.out.println("MOCK EMAIL SENT TO: " + toEmail);
        System.out.println("YOUR CAMPUS MARKETPLACE OTP IS: " + otp);
        System.out.println("===============================");

        try {
              SimpleMailMessage message = new SimpleMailMessage();

    message.setTo(toEmail);
    message.setFrom("yourgmail@gmail.com"); // add this (IMPORTANT)

    message.setSubject("Campus Marketplace - Account Verification OTP");

    message.setText(
            "Hello,\n\n" +
            "Welcome to Campus Marketplace!\n\n" +
            "Your One-Time Password (OTP) for account verification is: " + otp + "\n\n" +
            "This OTP is valid for 5 minutes.\n\n" +
            "Please do not share this OTP with anyone.\n\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "Regards,\nCampus Marketplace Team"
        );
        mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send real email: " + e.getMessage());
        }
    }
}
