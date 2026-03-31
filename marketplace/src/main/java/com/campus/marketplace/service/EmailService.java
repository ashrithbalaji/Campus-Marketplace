package com.campus.marketplace.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

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
    message.setFrom(senderEmail);

    message.setSubject("Campus Marketplace - Account Verification OTP");

    message.setText(
            "Hello there, future Campus Marketplace member!\n\n" +
            "We are absolutely thrilled to welcome you to the Campus Marketplace community! We are building a secure, reliable, and user-friendly platform specifically tailored for students and faculty like you to buy, sell, and connect with ease.\n\n" +
            "To complete your registration and verify your email address, we need you to provide the following verification code. Please enter it on the verification page to activate your account.\n\n" +
            "Your One-Time Password (OTP) for account verification is: " + otp + "\n\n" +
            "For your security, this OTP is valid for the next 5 minutes. Please be aware that our support team will never ask you for your password or your OTP.\n\n" +
            "Please do not share this OTP with anyone, not even with our staff or other members of the platform.\n\n" +
            "If you did not attempt to register an account with us or you believe you received this email in error, please disregard it completely. No further action is required on your part.\n\n" +
            "Thank you for choosing to be a part of our growing community!\n\n" +
            "Best Regards,\nThe Campus Marketplace Support Team\n" +
            "Automated Message - Please do not reply directly to this email."
        );
        mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send real email: " + e.getMessage());
        }
    }
}
