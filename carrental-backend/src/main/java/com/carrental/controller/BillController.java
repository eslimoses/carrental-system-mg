package com.carrental.controller;

import com.carrental.dto.BillDTO;
import com.carrental.service.BillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor

public class BillController {
    private final BillService billService;

    @PostMapping("/generate/{bookingId}")
    public ResponseEntity<?> generateBill(@PathVariable Long bookingId) {
        try {
            var bill = billService.generateBill(bookingId);
            return ResponseEntity.ok(bill);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBill(@PathVariable Long id) {
        try {
            var bill = billService.getBillById(id);
            return ResponseEntity.ok(bill);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getBillByBookingId(@PathVariable Long bookingId) {
        try {
            var bill = billService.getBillByBookingId(bookingId);
            return ResponseEntity.ok(bill);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BillDTO>> getCustomerBills(@PathVariable Long customerId) {
        return ResponseEntity.ok(billService.getCustomerBills(customerId));
    }

    @PostMapping("/{id}/mark-paid")
    public ResponseEntity<?> markBillAsPaid(@PathVariable Long id) {
        try {
            billService.markBillAsPaid(id);
            return ResponseEntity.ok("Bill marked as paid");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/send-notification")
    public ResponseEntity<?> sendBillNotification(@PathVariable Long id) {
        try {
            billService.sendBillNotification(id);
            return ResponseEntity.ok("Notification sent");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
