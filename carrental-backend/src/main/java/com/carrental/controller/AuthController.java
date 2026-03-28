package com.carrental.controller;

import com.carrental.dto.LoginRequest;
import com.carrental.dto.LoginResponse;
import com.carrental.dto.UserDTO;
import com.carrental.entity.User;
import com.carrental.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    private final UserService userService;
    private final com.carrental.repository.UserRepository userRepository;
    private final com.carrental.service.NotificationService notificationService;
    private final com.carrental.service.JwtService jwtService;
    
    // In-memory OTP storage (phone -> {otp, timestamp})
    private static final Map<String, Map<String, Object>> otpStorage = new ConcurrentHashMap<>();
    private static final int OTP_VALIDITY_MINUTES = 5;
    private static final int OTP_LENGTH = 6;

    @PostMapping("/register/customer")
    public ResponseEntity<?> registerCustomer(@RequestBody UserDTO userDTO) {
        try {
            User user = userService.registerUser(userDTO, User.UserRole.CUSTOMER);
            LoginResponse response = LoginResponse.builder()
                    .id(user.getId())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .email(user.getEmail())
                    .phoneNumber(user.getPhoneNumber())
                    .role(user.getRole().toString())
                    .city(user.getCity())
                    .address(user.getAddress())
                    .active(user.isActive())
                    .token(jwtService.generateToken(user))
                    .message("Registration successful")
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/register/admin")
    public ResponseEntity<?> registerAdmin(@RequestBody UserDTO userDTO) {
        try {
            User user = userService.registerUser(userDTO, User.UserRole.ADMIN);
            LoginResponse response = LoginResponse.builder()
                    .id(user.getId())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .email(user.getEmail())
                    .phoneNumber(user.getPhoneNumber())
                    .role(user.getRole().toString())
                    .city(user.getCity())
                    .address(user.getAddress())
                    .active(user.isActive())
                    .token(jwtService.generateToken(user))
                    .message("Admin registration successful")
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/reset-passwords")
    public ResponseEntity<?> resetPasswords() {
        try {
            // Reset admin password
            User admin = userService.getUserByEmail("eslimoses2005@gmail.com");
            admin.setPassword(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("Samborn0607"));
            userService.saveUser(admin);
            
            // Reset customer password
            User customer = userService.getUserByEmail("divyadharshini508205@gmail.com");
            customer.setPassword(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("Divya@2005"));
            userService.saveUser(customer);
            
            return ResponseEntity.ok("Passwords reset successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            User user = userService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
            
            // Create response with user data
            LoginResponse response = LoginResponse.builder()
                    .id(user.getId())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .email(user.getEmail())
                    .phoneNumber(user.getPhoneNumber())
                    .role(user.getRole().toString())
                    .city(user.getCity())
                    .address(user.getAddress())
                    .active(user.isActive())
                    .dateOfBirth(user.getDateOfBirth())
                    .profilePhoto(user.getProfilePhoto())
                    .licensePhotoFront(user.getLicensePhotoFront())
                    .licensePhotoBack(user.getLicensePhotoBack())
                    .token(jwtService.generateToken(user)) // Real JWT token
                    .message("Login successful")
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        System.out.println("==========================================");
        System.out.println("🚀 [API] HIT: /api/auth/send-otp");
        System.out.println("📩 Request Data: " + request);
        System.out.println("==========================================");
        try {
            String phoneNumber = request.get("phoneNumber");
            String email = request.get("email");
            
            // Validate phone number
            if (phoneNumber == null || phoneNumber.length() != 10 || !phoneNumber.matches("\\d+")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid phone number. Please enter a 10-digit number.");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Generate 6-digit OTP
            String otp = String.format("%06d", new Random().nextInt(1000000));
            
            // Store OTP with timestamp
            Map<String, Object> otpData = new HashMap<>();
            otpData.put("otp", otp);
            otpData.put("timestamp", LocalDateTime.now());
            otpData.put("email", email);
            otpStorage.put(phoneNumber, otpData);
            
            // 1. Send via Email
            if (email != null && !email.isEmpty()) {
                notificationService.sendOtpEmail(email, otp);
            }
            
            // 2. Send via WhatsApp (if registered or provided)
            if (phoneNumber != null && !phoneNumber.isEmpty()) {
                notificationService.sendWhatsAppMessage(phoneNumber, "Verified MotoGlide Login: Your OTP is " + otp + ". This is valid for 5 minutes.");
            }

            System.out.println("OTP for " + (phoneNumber != null ? phoneNumber : email) + ": " + otp);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP sent successfully");
            response.put("otp", otp); // For testing only - remove in production
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error sending OTP: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        String otp = request.get("otp");
        System.out.println("[DEBUG] Verification attempt for phone: " + phoneNumber + " with code: " + otp);

        try {
            // Check if OTP exists
            if (phoneNumber == null || !otpStorage.containsKey(phoneNumber)) {
                System.out.println("[DEBUG] Verification failed: Phone number not found in OTP cache.");
                Map<String, String> error = new HashMap<>();
                error.put("message", "OTP not found for this phone number. Please request a new code.");
                return ResponseEntity.badRequest().body(error);
            }
            
            Map<String, Object> otpData = otpStorage.get(phoneNumber);
            String storedOtp = (String) otpData.get("otp");
            LocalDateTime timestamp = (LocalDateTime) otpData.get("timestamp");
            String storedEmail = (String) otpData.get("email");

            System.out.println("[DEBUG] Stored OTP was: " + storedOtp + " for email: " + storedEmail);
            
            // Check OTP validity
            long minutesPassed = ChronoUnit.MINUTES.between(timestamp, LocalDateTime.now());
            if (minutesPassed > OTP_VALIDITY_MINUTES) {
                otpStorage.remove(phoneNumber);
                System.out.println("[DEBUG] Verification failed: OTP expired.");
                Map<String, String> error = new HashMap<>();
                error.put("message", "OTP expired. Please request a new OTP.");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Verify OTP
            if (!storedOtp.equals(otp)) {
                System.out.println("[DEBUG] Verification failed: Code mismatch.");
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid OTP code. Please try again.");
                return ResponseEntity.badRequest().body(error);
            }
            
            // OTP verified successfully
            System.out.println("[DEBUG] OTP Verified Successfully. Removing from cache.");
            otpStorage.remove(phoneNumber);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "OTP verified successfully");
            
            // Use storedEmail for token generation
            if (storedEmail != null) {
                System.out.println("[DEBUG] Generating token for: " + storedEmail);
                // Safe lookup: don't throw if missing, it's normal for new signups
                User user = userRepository.findByEmail(storedEmail).orElse(null);
                if (user != null) {
                    response.put("token", jwtService.generateToken(user));
                    response.put("isExistingUser", true);
                } else {
                    response.put("token", "verification-success-token-" + System.currentTimeMillis());
                    response.put("isExistingUser", false);
                }
            } else {
                response.put("token", "verification-success-token-" + System.currentTimeMillis());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to verify OTP: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error verifying OTP: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Update fields if provided
            if (request.containsKey("firstName")) {
                user.setFirstName(request.get("firstName"));
            }
            if (request.containsKey("lastName")) {
                user.setLastName(request.get("lastName"));
            }
            if (request.containsKey("phoneNumber")) {
                user.setPhoneNumber(request.get("phoneNumber"));
            }
            if (request.containsKey("dateOfBirth")) {
                user.setDateOfBirth(request.get("dateOfBirth"));
            }
            if (request.containsKey("licensePhotoFront")) {
                user.setLicensePhotoFront(request.get("licensePhotoFront"));
            }
            if (request.containsKey("licensePhotoBack")) {
                user.setLicensePhotoBack(request.get("licensePhotoBack"));
            }
            if (request.containsKey("profilePhoto")) {
                user.setProfilePhoto(request.get("profilePhoto"));
            }
            if (request.containsKey("city")) {
                user.setCity(request.get("city"));
            }
            if (request.containsKey("address")) {
                user.setAddress(request.get("address"));
            }
            
            userService.saveUser(user);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error updating profile: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found");
                return ResponseEntity.badRequest().body(error);
            }
            
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching profile: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
