package com.carrental.controller;

import com.carrental.entity.*;
import com.carrental.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.carrental.service.NotificationService;
import com.carrental.service.PdfGeneratorService;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final CityRepository cityRepository;
    private final VehicleCategoryRepository categoryRepository;
    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final PdfGeneratorService pdfGeneratorService;
    private final NotificationService notificationService;

    // Dashboard Statistics
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalUsers", userRepository.count());
        stats.put("totalVehicles", vehicleRepository.count());
        stats.put("totalBookings", bookingRepository.count());
        stats.put("totalCities", cityRepository.count());
        stats.put("totalCategories", categoryRepository.count());
        
        // Recent bookings
        stats.put("recentBookings", bookingRepository.findTop10ByOrderByCreatedAtDesc());
        
        // Revenue calculation
        List<Payment> successfulPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCESS)
                .collect(Collectors.toList());

        BigDecimal advanceRevenue = successfulPayments.stream()
                .filter(p -> p.getPaymentType() == Payment.PaymentType.ADVANCE)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal rentalRevenue = successfulPayments.stream()
                .filter(p -> p.getPaymentType() == Payment.PaymentType.RENTAL)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal extraChargesRevenue = successfulPayments.stream()
                .filter(p -> p.getPaymentType() == Payment.PaymentType.EXTRA_CHARGES)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal returnedRevenue = successfulPayments.stream()
                .filter(p -> p.getPaymentType() == Payment.PaymentType.REFUND)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate total revenue: All positive payments minus refunds
        BigDecimal totalRevenue = advanceRevenue.add(rentalRevenue).add(extraChargesRevenue).subtract(returnedRevenue);

        stats.put("totalRevenue", totalRevenue);
        stats.put("advanceRevenue", advanceRevenue);
        stats.put("rentalRevenue", rentalRevenue);
        stats.put("extraChargesRevenue", extraChargesRevenue);
        stats.put("returnedRevenue", returnedRevenue);

        // Periodic Revenue
        LocalDateTime now = LocalDateTime.now();
        stats.put("revenue24h", calculateRevenueSince(now.minusHours(24)));
        stats.put("revenue7d", calculateRevenueSince(now.minusDays(7)));
        stats.put("revenue30d", calculateRevenueSince(now.minusDays(30)));

        // P&L Summary
        BigDecimal grossRevenue = totalRevenue;
        BigDecimal opsExpenses = grossRevenue.multiply(new BigDecimal("0.25")); // 25% overhead as per requirement
        BigDecimal netProfit = grossRevenue.subtract(opsExpenses);

        stats.put("grossRevenue", grossRevenue);
        stats.put("opsExpenses", opsExpenses);
        stats.put("netProfit", netProfit);

        // Enhanced Maintenance/Compliance Stats
        List<Vehicle> allVehicles = vehicleRepository.findAll();
        long maintenanceDueCount = allVehicles.stream()
            .filter(v -> v.getStatus() == Vehicle.VehicleStatus.MAINTENANCE || 
                         (v.getInsuranceValidTill() != null && ChronoUnit.DAYS.between(now.toLocalDate(), v.getInsuranceValidTill()) < 30) ||
                         (v.getRegistrationValidTill() != null && ChronoUnit.DAYS.between(now.toLocalDate(), v.getRegistrationValidTill()) < 30))
            .count();
            
        stats.put("maintenanceDueCount", maintenanceDueCount);
        
        return ResponseEntity.ok(stats);
    }

    private BigDecimal calculateRevenueSince(LocalDateTime since) {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCESS)
                .filter(p -> p.getCreatedAt().isAfter(since))
                .filter(p -> p.getPaymentType() != Payment.PaymentType.REFUND)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @PostMapping("/reports/financial/email")
    public ResponseEntity<?> emailFinancialReport(@RequestParam String email) {
        try {
            Map<String, Object> stats = (Map<String, Object>) getDashboardStats().getBody();
            byte[] pdf = pdfGeneratorService.generateFinancialReportPdf(stats);
            notificationService.sendFinancialReport(email, pdf);
            return ResponseEntity.ok("Report emailed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send report: " + e.getMessage());
        }
    }

    @GetMapping("/reports/financial/download")
    public ResponseEntity<byte[]> downloadFinancialReport() {
        Map<String, Object> stats = (Map<String, Object>) getDashboardStats().getBody();
        byte[] pdf = pdfGeneratorService.generateFinancialReportPdf(stats);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=MotoGlide_Financial_Report.pdf")
                .body(pdf);
    }

    @GetMapping("/compliance/maintenance-due")
    public ResponseEntity<List<Vehicle>> getMaintenanceDueVehicles() {
        return ResponseEntity.ok(vehicleRepository.findByStatus(Vehicle.VehicleStatus.MAINTENANCE));
    }

    // User Management
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setRole(User.UserRole.valueOf(request.get("role")));
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> request) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setActive(request.get("isActive"));
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok("User deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return userRepository.findById(id)
                .map(user -> {
                    if (request.containsKey("firstName")) user.setFirstName(request.get("firstName"));
                    if (request.containsKey("lastName")) user.setLastName(request.get("lastName"));
                    if (request.containsKey("phoneNumber")) user.setPhoneNumber(request.get("phoneNumber"));
                    if (request.containsKey("email")) user.setEmail(request.get("email"));
                    if (request.containsKey("role")) user.setRole(User.UserRole.valueOf(request.get("role")));
                    if (request.containsKey("city")) user.setCity(request.get("city"));
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Booking Management
    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingRepository.findAll());
    }

    @GetMapping("/bookings/pending")
    public ResponseEntity<List<Booking>> getPendingBookings() {
        return ResponseEntity.ok(bookingRepository.findByStatus(Booking.BookingStatus.PENDING));
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return bookingRepository.findById(id)
                .map(booking -> {
                    Booking.BookingStatus newStatus = Booking.BookingStatus.valueOf(request.get("status"));
                    booking.setStatus(newStatus);
                    
                    // If booking is completed or cancelled, make vehicle available again
                    if (newStatus == Booking.BookingStatus.COMPLETED || newStatus == Booking.BookingStatus.CANCELLED) {
                        Vehicle vehicle = booking.getVehicle();
                        vehicle.setStatus(Vehicle.VehicleStatus.AVAILABLE);
                        vehicleRepository.save(vehicle);
                    } else if (newStatus == Booking.BookingStatus.ACTIVE) {
                        Vehicle vehicle = booking.getVehicle();
                        vehicle.setStatus(Vehicle.VehicleStatus.RENTED);
                        vehicleRepository.save(vehicle);
                    }
                    
                    return ResponseEntity.ok(bookingRepository.save(booking));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Vehicle Management
    @GetMapping("/vehicles")
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleRepository.findAll());
    }

    @PutMapping("/vehicles/{id}/status")
    public ResponseEntity<?> updateVehicleStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return vehicleRepository.findById(id)
                .map(vehicle -> {
                    vehicle.setStatus(Vehicle.VehicleStatus.valueOf(request.get("status")));
                    return ResponseEntity.ok(vehicleRepository.save(vehicle));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Payment Management
    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentRepository.findAll());
    }

    // Reports
    @GetMapping("/reports/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Map<String, Object> report = new HashMap<>();
        
        List<Payment> payments = paymentRepository.findAll();
        List<Payment> successfulPayments = payments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus().name()))
                .toList();

        BigDecimal advanceRevenue = successfulPayments.stream()
                .filter(p -> "ADVANCE".equals(p.getPaymentType().name()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal rentalRevenue = successfulPayments.stream()
                .filter(p -> "RENTAL".equals(p.getPaymentType().name()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal extraChargesRevenue = successfulPayments.stream()
                .filter(p -> "EXTRA_CHARGES".equals(p.getPaymentType().name()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal returnedRevenue = successfulPayments.stream()
                .filter(p -> "REFUND".equals(p.getPaymentType().name()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRevenue = advanceRevenue.add(rentalRevenue).add(extraChargesRevenue).subtract(returnedRevenue);
        
        report.put("totalRevenue", totalRevenue);
        report.put("advanceRevenue", advanceRevenue);
        report.put("rentalRevenue", rentalRevenue);
        report.put("returnedRevenue", returnedRevenue);
        report.put("totalPayments", payments.size());
        report.put("completedPayments", successfulPayments.size());
        
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/bookings")
    public ResponseEntity<Map<String, Object>> getBookingReport() {
        Map<String, Object> report = new HashMap<>();
        
        List<Booking> bookings = bookingRepository.findAll();
        report.put("totalBookings", bookings.size());
        report.put("pendingBookings", bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.PENDING).count());
        report.put("activeBookings", bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.ACTIVE).count());
        report.put("completedBookings", bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED).count());
        report.put("cancelledBookings", bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CANCELLED).count());
        
        return ResponseEntity.ok(report);
    }

    // Generic reports endpoint for frontend
    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getGenericReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Map<String, Object> report = new HashMap<>();
        report.put("revenue", getRevenueReport(startDate, endDate).getBody());
        report.put("bookings", getBookingReport().getBody());
        return ResponseEntity.ok(report);
    }
}
