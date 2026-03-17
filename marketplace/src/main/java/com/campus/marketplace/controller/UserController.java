package com.campus.marketplace.controller;

import com.campus.marketplace.dto.DeleteAccountRequest;
import com.campus.marketplace.dto.UserProfileUpdateRequest;
import com.campus.marketplace.model.User;
import com.campus.marketplace.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Allow frontend requests
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody UserProfileUpdateRequest request) {
        try {
            User updatedUser = userService.updateProfile(id, request.getMobileNumber());
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while updating profile", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long id, @RequestBody DeleteAccountRequest request) {
        try {
            userService.deleteAccount(id, request.getPassword());
            return new ResponseEntity<>("Account deleted successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while deleting account", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
