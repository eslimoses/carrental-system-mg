package com.carrental.controller;

import com.carrental.dto.UserDTO;
import com.carrental.entity.User;
import com.carrental.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor

public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            Long userId = extractUserId(token);
            if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
            
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody Map<String, String> request) {
        try {
            Long userId = extractUserId(token);
            if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

            User user = userService.getUserById(userId);
            if (request.containsKey("firstName")) user.setFirstName(request.get("firstName"));
            if (request.containsKey("lastName")) user.setLastName(request.get("lastName"));
            if (request.containsKey("phoneNumber")) user.setPhoneNumber(request.get("phoneNumber"));
            if (request.containsKey("city")) user.setCity(request.get("city"));
            if (request.containsKey("address")) user.setAddress(request.get("address"));
            
            userService.saveUser(user);
            return ResponseEntity.ok("Profile updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        // This is typically for admins, but exposing as per userAPI.getAll()
        // In a real app, this would have @PreAuthorize("hasRole('ADMIN')")
        // But for now, we'll just return all users
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody Map<String, String> request) {
        try {
            Long userId = extractUserId(token);
            if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");

            User user = userService.getUserById(userId);
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body("Incorrect old password");
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            userService.saveUser(user);
            return ResponseEntity.ok("Password changed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private Long extractUserId(String token) {
        if (token == null || !token.startsWith("Bearer dummy-jwt-token-")) {
            return null;
        }
        try {
            return Long.parseLong(token.replace("Bearer dummy-jwt-token-", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
