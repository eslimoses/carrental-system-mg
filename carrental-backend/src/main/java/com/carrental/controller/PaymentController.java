package com.carrental.controller;

import com.carrental.dto.PaymentDTO;
import com.carrental.entity.Payment;
import com.carrental.repository.PaymentRepository;
import com.carrental.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {
    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;

    @org.springframework.beans.factory.annotation.Value("${razorpay.key.id}")
    private String razorpayKeyId;

    /**
     * Unified payment processing endpoint.
     * Finalizes payment, updates booking status, generates invoice,
     * records transaction in payment history, and sends confirmation email.
     */
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody PaymentDTO paymentDTO) {
        try {
            var result = paymentService.processFullPayment(paymentDTO.getBookingId(), paymentDTO);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/advance/{bookingId}")
    public ResponseEntity<?> processAdvancePayment(
            @PathVariable Long bookingId,
            @RequestBody PaymentDTO paymentDTO) {
        try {
            var payment = paymentService.processAdvancePayment(bookingId, paymentDTO);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/rental/{bookingId}")
    public ResponseEntity<?> processRentalPayment(
            @PathVariable Long bookingId,
            @RequestBody PaymentDTO paymentDTO) {
        try {
            var payment = paymentService.processRentalPayment(bookingId, paymentDTO);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/extra-charges/{bookingId}")
    public ResponseEntity<?> processExtraChargesPayment(
            @PathVariable Long bookingId,
            @RequestParam Double extraCharges,
            @RequestBody PaymentDTO paymentDTO) {
        try {
            var payment = paymentService.processExtraChargesPayment(bookingId, extraCharges, paymentDTO);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PaymentDTO>> getBookingPayments(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getBookingPayments(bookingId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getCustomerPayments(@PathVariable Long customerId) {
        try {
            List<Payment> payments = paymentRepository.findByBooking_Customer_IdOrderByPaymentDateDesc(customerId);
            List<PaymentDTO> paymentDTOs = payments.stream().map(p -> PaymentDTO.builder()
                    .id(p.getId())
                    .bookingId(p.getBooking().getId())
                    .amount(p.getAmount())
                    .paymentType(p.getPaymentType() != null ? p.getPaymentType().toString() : null)
                    .paymentMethod(p.getPaymentMethod() != null ? p.getPaymentMethod().toString() : null)
                    .transactionId(p.getTransactionId())
                    .status(p.getStatus() != null ? p.getStatus().toString() : null)
                    .paymentDate(p.getPaymentDate())
                    .build()
            ).collect(Collectors.toList());
            return ResponseEntity.ok(paymentDTOs);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentRepository.findAll());
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<?> verifyPayment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(paymentService.verifyPayment(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- Razorpay Specific Endpoints ---

    @GetMapping("/razorpay-key")
    public ResponseEntity<?> getRazorpayKey() {
        return ResponseEntity.ok(Map.of("keyId", razorpayKeyId));
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            Double amount = Double.valueOf(data.get("amount").toString());
            String bookingNumber = data.get("bookingNumber").toString();
            String orderId = paymentService.createRazorpayOrder(amount, bookingNumber);
            return ResponseEntity.ok(Map.of("orderId", orderId, "amount", amount, "currency", "INR"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error creating Razorpay order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-signature")
    public ResponseEntity<?> verifySignature(@RequestBody Map<String, String> data) {
        String orderId = data.get("orderId");
        String paymentId = data.get("paymentId");
        String signature = data.get("signature");
        
        boolean isValid = paymentService.verifySignature(orderId, paymentId, signature);
        if (isValid) {
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Payment verified successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "FAILED", "message", "Invalid payment signature"));
        }
    }
}
