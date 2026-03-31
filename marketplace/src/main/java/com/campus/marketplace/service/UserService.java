package com.campus.marketplace.service;

import com.campus.marketplace.dto.SignupRequest;
import com.campus.marketplace.dto.LoginRequest;
import com.campus.marketplace.model.User;
import com.campus.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public User registerUser(SignupRequest request) {
        // Validate domain
        if (request.getEmail() == null || !request.getEmail().endsWith("@anurag.edu.in")) {
            throw new IllegalArgumentException("Registration is restricted to @anurag.edu.in emails only.");
        }

        // Validate password rules (min 8 chars, 1 uppercase, 1 special, 4 digits)
        if (!isValidPassword(request.getPassword())) {
            throw new IllegalArgumentException("Password does not meet the required complexity rules (min 8 chars, 1 uppercase, 1 special, 4 numbers).");
        }

        // Check for duplicates and handle unverified accounts
        Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.isVerified()) {
                throw new IllegalArgumentException("Email already exists and is verified. Please log in.");
            } else {
                // If the user exists but is not verified, overwrite their info and resend OTP
                existingUser.setName(request.getName());
                existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
                existingUser.setMobileNumber(request.getMobileNumber());
                
                String generatedOtp = emailService.generateOTP();
                existingUser.setOtp(generatedOtp);
                emailService.sendOTP(existingUser.getEmail(), generatedOtp);

                return userRepository.save(existingUser);
            }
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setMobileNumber(request.getMobileNumber());
        
        // Generate and send OTP
        String generatedOtp = emailService.generateOTP();
        user.setOtp(generatedOtp);
        user.setVerified(false);
        emailService.sendOTP(user.getEmail(), generatedOtp);

        return userRepository.save(user);
    }
    
    public boolean verifyOtp(String email, String otp) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.getOtp() != null && user.getOtp().equals(otp)) {
                user.setVerified(true);
                user.setOtp(null); // Clear OTP after successful verification
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    public User loginUser(LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (!user.isVerified()) {
                throw new IllegalArgumentException("Account not verified. Please verify your OTP.");
            }
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return user;
            }
        }
        throw new IllegalArgumentException("Invalid email or password.");
    }

    private boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) return false;
        
        boolean hasUppercase = !password.equals(password.toLowerCase());
        
        long digitCount = password.chars().filter(Character::isDigit).count();
        if (digitCount < 4) return false;

        Pattern specialPattern = Pattern.compile("[^a-zA-Z0-9 ]");
        boolean hasSpecial = specialPattern.matcher(password).find();

        return hasUppercase && hasSpecial && digitCount >= 4;
    }

    public User updateProfile(Long userId, String mobileNumber) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setMobileNumber(mobileNumber);
            return userRepository.save(user);
        }
        throw new IllegalArgumentException("User not found.");
    }

    public void deleteAccount(Long userId, String password) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                userRepository.delete(user);
                return;
            } else {
                throw new IllegalArgumentException("Incorrect password. Cannot delete account.");
            }
        }
        throw new IllegalArgumentException("User not found.");
    }
}