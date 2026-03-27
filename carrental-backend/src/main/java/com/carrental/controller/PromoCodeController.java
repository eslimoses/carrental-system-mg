package com.carrental.controller;

import com.carrental.entity.PromoCode;
import com.carrental.repository.PromoCodeRepository;
import com.carrental.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promo-codes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PromoCodeController {
    private final PromoCodeRepository promoCodeRepository;
    private final com.carrental.repository.BookingRepository bookingRepository;
    private final NotificationService notificationService;


    @PostMapping("/validate")
    public ResponseEntity<?> validatePromoCode(@RequestBody Map<String, Object> request) {
        String code = (String) request.get("code");
        Long userId = request.get("userId") != null ? Long.valueOf(request.get("userId").toString()) : null;
        
        if (code == null || code.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Please enter a promo code");
            return ResponseEntity.badRequest().body(error);
        }

        return promoCodeRepository.findByCode(code.toUpperCase())
                .map(promo -> {
                    Map<String, Object> response = new HashMap<>();

                    // Check if user already used this code if userId is provided
                    if (userId != null && bookingRepository.existsByCustomer_IdAndCouponCode(userId, code.toUpperCase())) {
                        response.put("valid", false);
                        response.put("message", "You have already used this promo code");
                        return ResponseEntity.ok(response);
                    }

                    if (!promo.getIsActive()) {
                        response.put("valid", false);
                        response.put("message", "This promo code is no longer active");
                        return ResponseEntity.ok(response);
                    }

                    LocalDateTime now = LocalDateTime.now();
                    if (promo.getValidFrom() != null && now.isBefore(promo.getValidFrom())) {
                        response.put("valid", false);
                        response.put("message", "This promo code is not yet valid");
                        return ResponseEntity.ok(response);
                    }

                    if (promo.getValidUntil() != null && now.isAfter(promo.getValidUntil())) {
                        response.put("valid", false);
                        response.put("message", "This promo code has expired");
                        return ResponseEntity.ok(response);
                    }

                    if (promo.getUsageLimit() != null && promo.getUsedCount() >= promo.getUsageLimit()) {
                        response.put("valid", false);
                        response.put("message", "This promo code has reached its usage limit");
                        return ResponseEntity.ok(response);
                    }

                    response.put("valid", true);
                    response.put("discountPercentage", promo.getDiscountPercentage());
                    response.put("maxDiscountAmount", promo.getMaxDiscountAmount());
                    response.put("message", "Promo code applied! " + promo.getDiscountPercentage() + "% discount");
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("valid", false);
                    response.put("message", "Invalid promo code");
                    return ResponseEntity.ok(response);
                });
    }

    @GetMapping
    public ResponseEntity<List<PromoCode>> getAllPromoCodes() {
        return ResponseEntity.ok(promoCodeRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createPromoCode(@RequestBody PromoCode promoCode) {
        try {
            if (promoCodeRepository.existsByCode(promoCode.getCode())) {
                return ResponseEntity.badRequest().body("Promo code already exists");
            }
            return ResponseEntity.ok(promoCodeRepository.save(promoCode));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePromoCode(@PathVariable Long id, @RequestBody PromoCode promoCodeDetails) {
        return promoCodeRepository.findById(id).map(existingPromo -> {
            existingPromo.setCode(promoCodeDetails.getCode());
            existingPromo.setDescription(promoCodeDetails.getDescription());
            existingPromo.setImageUrl(promoCodeDetails.getImageUrl());
            existingPromo.setCategory(promoCodeDetails.getCategory());
            existingPromo.setDiscountPercentage(promoCodeDetails.getDiscountPercentage());
            existingPromo.setMaxDiscountAmount(promoCodeDetails.getMaxDiscountAmount());
            if (promoCodeDetails.getValidFrom() != null) {
                existingPromo.setValidFrom(promoCodeDetails.getValidFrom());
            }
            if (promoCodeDetails.getValidUntil() != null) {
                existingPromo.setValidUntil(promoCodeDetails.getValidUntil());
            }
            if (promoCodeDetails.getUsageLimit() != null) {
                existingPromo.setUsageLimit(promoCodeDetails.getUsageLimit());
            }
            if (promoCodeDetails.getIsActive() != null) {
                existingPromo.setIsActive(promoCodeDetails.getIsActive());
            }
            return ResponseEntity.ok(promoCodeRepository.save(existingPromo));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromoCode(@PathVariable Long id) {
        if (!promoCodeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        try {
            promoCodeRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Failed to delete promo code: " + e.getMessage()));
        }
    }

    /**
     * Send offer notification via email + WhatsApp.
     * POST /api/promo-codes/{id}/notify
     * Body (optional): { "email": "customer@example.com" }
     * If email is omitted or null, sends to ALL active customers.
     */
    @PostMapping("/{id}/notify")
    public ResponseEntity<?> sendOfferNotification(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        return promoCodeRepository.findById(id)
                .map(offer -> {
                    try {
                        String targetEmail = request != null ? request.get("email") : null;
                        notificationService.sendOfferNotification(offer, targetEmail);
                        String msg = (targetEmail != null && !targetEmail.isBlank())
                                ? "Offer notification sent to " + targetEmail
                                : "Offer notification broadcast to all customers";
                        return ResponseEntity.ok(Map.of("message", msg));
                    } catch (Exception e) {
                        return ResponseEntity.internalServerError()
                                .body(Map.of("error", "Failed to send offer notifications: " + e.getMessage()));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
