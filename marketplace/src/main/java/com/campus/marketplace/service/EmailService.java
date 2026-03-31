package com.campus.marketplace.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import java.io.IOException;
import java.util.Random;

@Service
public class EmailService {

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${SENDGRID_API_KEY}")
    private String sendGridApiKey;

    public String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    @Async
    public void sendOTP(String toEmail, String otp) {
        // Echo mock email to console for simple debugging/demo checking
        System.out.println("===============================");
        System.out.println("MOCK EMAIL SENT TO: " + toEmail);
        System.out.println("YOUR CAMPUS MARKETPLACE OTP IS: " + otp);
        System.out.println("===============================");

        try {
            Email from = new Email(senderEmail);
            String subject = "Campus Marketplace - Account Verification OTP";
            Email to = new Email(toEmail);
            Content content = new Content("text/plain", 
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
            
            Mail mail = new Mail(from, subject, to, content);
            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sg.api(request);
            System.out.println("SendGrid Response Code: " + response.getStatusCode());
        } catch (IOException ex) {
            System.err.println("Failed to send SendGrid email: " + ex.getMessage());
        }
    }
}
