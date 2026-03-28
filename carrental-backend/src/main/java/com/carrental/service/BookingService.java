package com.carrental.service;

import com.carrental.dto.BookingDTO;
import com.carrental.dto.UserDTO;
import com.carrental.dto.VehicleDTO;
import com.carrental.entity.*;
import com.carrental.entity.Booking.BookingStatus;
import com.carrental.entity.Booking.DeliveryType;
import com.carrental.entity.Vehicle.VehicleStatus;
import com.carrental.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carrental.entity.Payment;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final CityRepository cityRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final PromoCodeRepository promoCodeRepository;
    
    // Early booking discount rates
    private static final BigDecimal DISCOUNT_7_DAYS = new BigDecimal("0.05");  // 5% off for 7+ days advance
    private static final BigDecimal DISCOUNT_14_DAYS = new BigDecimal("0.10"); // 10% off for 14+ days advance
    private static final BigDecimal DISCOUNT_30_DAYS = new BigDecimal("0.15"); // 15% off for 30+ days advance
    
    // Loyalty discount rates (based on previous completed bookings)
    private static final BigDecimal LOYALTY_DISCOUNT_1_2 = new BigDecimal("0.05");   // 5% off for 1-2 bookings
    private static final BigDecimal LOYALTY_DISCOUNT_3_4 = new BigDecimal("0.10");   // 10% off for 3-4 bookings
    private static final BigDecimal LOYALTY_DISCOUNT_5_PLUS = new BigDecimal("0.15"); // 15% off for 5+ bookings
    
    // Extra charges
    private static final BigDecimal INSURANCE_PER_DAY = new BigDecimal("150.00");
    private static final BigDecimal GPS_PER_DAY = new BigDecimal("50.00");
    private static final BigDecimal CHILD_SEAT_PER_DAY = new BigDecimal("75.00");
    private static final BigDecimal ADDITIONAL_DRIVER_PER_DAY = new BigDecimal("100.00");

    public Booking createBooking(BookingDTO bookingDTO) {
        System.out.println("[DEBUG] Start createBooking for vehicleId: " + bookingDTO.getVehicleId());
        
        // Get entities
        User customer = userRepository.findById(bookingDTO.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Vehicle vehicle = vehicleRepository.findById(bookingDTO.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        City city = vehicle.getCity();

        System.out.println("[DEBUG] Entities loaded: Customer=" + customer.getEmail() + ", Vehicle=" + vehicle.getModel());

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new RuntimeException("This car is currently already " + vehicle.getStatus() + ". Please choose another vehicle.");
        }

        // Check for conflicting bookings
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                bookingDTO.getVehicleId(),
                bookingDTO.getPickupDate(),
                bookingDTO.getReturnDate()
        );

        System.out.println("[DEBUG] Dates validated. No conflicts found.");

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Vehicle is already booked for the selected dates");
        }

        Booking booking = new Booking();
        System.out.println("[DEBUG] Booking object created.");
        booking.setBookingNumber("BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setCustomer(customer);
        booking.setVehicle(vehicle);
        booking.setCity(city);
        booking.setPickupDate(bookingDTO.getPickupDate());
        booking.setReturnDate(bookingDTO.getReturnDate());
        booking.setPickupTime(bookingDTO.getPickupTime());
        booking.setReturnTime(bookingDTO.getReturnTime());
        booking.setDeliveryType(DeliveryType.valueOf(bookingDTO.getDeliveryType()));
        booking.setDeliveryLocation(bookingDTO.getDeliveryLocation());
        booking.setDeliveryFee(bookingDTO.getDeliveryFee() != null ? bookingDTO.getDeliveryFee() : BigDecimal.ZERO);
        booking.setStatus(BookingStatus.PENDING);
        booking.setAdvancePaid(false);

        // Calculate rental duration
        long days = ChronoUnit.DAYS.between(bookingDTO.getPickupDate(), bookingDTO.getReturnDate());
        if (days < 1) days = 1;
        
        // Calculate base rental cost
        BigDecimal rentalCost = calculateRentalCost(vehicle, days);
        
        // Calculate early booking discount
        long daysInAdvance = ChronoUnit.DAYS.between(LocalDate.now(), bookingDTO.getPickupDate());
        BigDecimal earlyBookingDiscount = calculateEarlyBookingDiscount(daysInAdvance);
        
        // Calculate loyalty discount based on previous bookings
        BigDecimal loyaltyDiscount = calculateLoyaltyDiscount(customer);
        
        // Apply the higher discount (early booking or loyalty)
        BigDecimal discountRate = earlyBookingDiscount.max(loyaltyDiscount);
        BigDecimal discountAmount = rentalCost.multiply(discountRate).setScale(2, RoundingMode.HALF_UP);
        booking.setDiscountAmount(discountAmount);
        booking.setDiscountPercentage(discountRate.multiply(BigDecimal.valueOf(100)).intValue());
        
        // Calculate extra charges
        BigDecimal extraCharges = calculateExtraCharges(bookingDTO, days);
        booking.setExtraCharges(extraCharges);
        
        // Calculate delivery fee based on distance
        BigDecimal deliveryFee = calculateDeliveryFee(bookingDTO, city);
        booking.setDeliveryFee(deliveryFee);
        booking.setDeliveryDistanceKm(bookingDTO.getDeliveryDistance() != null ? bookingDTO.getDeliveryDistance() : BigDecimal.ZERO);
        
        // Set extra options
        booking.setIncludeInsurance(bookingDTO.getIncludeInsurance());
        booking.setIncludeGps(bookingDTO.getIncludeGps());
        booking.setIncludeChildSeat(bookingDTO.getIncludeChildSeat());
        booking.setAdditionalDrivers(bookingDTO.getAdditionalDrivers());
        
        // Store coupon info if provided
        BigDecimal couponDiscount = BigDecimal.ZERO;
        if (bookingDTO.getCouponCode() != null && !bookingDTO.getCouponCode().isEmpty()) {
            String codeInput = bookingDTO.getCouponCode().toUpperCase();
            
            // 1. Check if this customer has already used this code in a previous booking
            if (bookingRepository.existsByCustomer_IdAndCouponCode(customer.getId(), codeInput)) {
                throw new RuntimeException("This coupon has already been used by you");
            }

            // 2. Check usage limit in PromoCode table if it exists
            promoCodeRepository.findByCode(codeInput).ifPresent(promo -> {
                if (!promo.getIsActive()) {
                    throw new RuntimeException("This promo code is no longer active");
                }
                if (promo.getUsageLimit() != null && promo.getUsedCount() >= promo.getUsageLimit()) {
                    throw new RuntimeException("This promo code has reached its usage limit");
                }
                
                // Increment used count
                promo.setUsedCount(promo.getUsedCount() + 1);
                promoCodeRepository.save(promo);
            });

            booking.setCouponCode(codeInput);
            couponDiscount = bookingDTO.getCouponDiscount() != null ? bookingDTO.getCouponDiscount() : BigDecimal.ZERO;
            booking.setCouponDiscount(couponDiscount);
        }
        
        // Set final amounts
        BigDecimal discountedRental = rentalCost.subtract(discountAmount);
        booking.setRentalAmount(discountedRental);
        booking.setAdvanceAmount(discountedRental.divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP));
        BigDecimal totalBeforeCoupon = discountedRental.add(deliveryFee).add(extraCharges);
        BigDecimal totalAfterCoupon = totalBeforeCoupon.subtract(couponDiscount).max(BigDecimal.ZERO);
        booking.setTotalAmount(totalAfterCoupon);

        System.out.println("[DEBUG] Cost calculated: " + booking.getTotalAmount());
        
        System.out.println("[DEBUG] Attempting to save booking to DB...");
        Booking saved = bookingRepository.save(booking);
        System.out.println("[DEBUG] Booking saved successfully with ID: " + saved.getId());
        
        // Send booking confirmation email
        // Send booking confirmation notifications (safe error handling)
        System.out.println("[DEBUG] Triggering async notification for booking: " + saved.getBookingNumber());
        try {
            notificationService.sendBookingConfirmation(saved);
        } catch (Throwable e) {
            System.err.println("[DEBUG] Async notification trigger failed: " + e.getMessage());
            e.printStackTrace();
            // Safe fallback: plain text
            notificationService.sendEmail(customer.getEmail(), "Booking Confirmation - " + saved.getBookingNumber(),
                "Dear " + customer.getFirstName() + ",\n\nYour booking " + saved.getBookingNumber() + " is confirmed.\n"
                + "Period: " + (saved.getPickupDate() != null ? saved.getPickupDate() : "") + " to " + (saved.getReturnDate() != null ? saved.getReturnDate() : "") + "\n"
                + "Total: Rs. " + (saved.getTotalAmount() != null ? saved.getTotalAmount() : "0.00") + "\n\nThank you for choosing MotoGlide!");
        }

        System.out.println("[DEBUG] Returning saved booking to controller.");
        return saved;
    }

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAllWithDetails()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Booking updateBooking(Long id, BookingDTO bookingDTO) {
        Booking booking = getBookingById(id);

        if (bookingDTO.getPickupDate() != null) booking.setPickupDate(bookingDTO.getPickupDate());
        if (bookingDTO.getReturnDate() != null) booking.setReturnDate(bookingDTO.getReturnDate());
        if (bookingDTO.getPickupTime() != null) booking.setPickupTime(bookingDTO.getPickupTime());
        if (bookingDTO.getReturnTime() != null) booking.setReturnTime(bookingDTO.getReturnTime());
        if (bookingDTO.getDeliveryType() != null) booking.setDeliveryType(DeliveryType.valueOf(bookingDTO.getDeliveryType()));
        if (bookingDTO.getDeliveryLocation() != null) booking.setDeliveryLocation(bookingDTO.getDeliveryLocation());
        if (bookingDTO.getIncludeInsurance() != null) booking.setIncludeInsurance(bookingDTO.getIncludeInsurance());
        if (bookingDTO.getIncludeGps() != null) booking.setIncludeGps(bookingDTO.getIncludeGps());
        if (bookingDTO.getIncludeChildSeat() != null) booking.setIncludeChildSeat(bookingDTO.getIncludeChildSeat());
        if (bookingDTO.getAdditionalDrivers() != null) booking.setAdditionalDrivers(bookingDTO.getAdditionalDrivers());
        if (bookingDTO.getStatus() != null) booking.setStatus(BookingStatus.valueOf(bookingDTO.getStatus()));

        return bookingRepository.save(booking);
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public List<BookingDTO> getCustomerBookings(Long customerId) {
        return bookingRepository.findByCustomer_IdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void confirmBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);
    }

    public void startRental(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        booking.setStatus(BookingStatus.ACTIVE);
        bookingRepository.save(booking);
    }

    @Transactional
    public void completeRental(Long bookingId, Integer returnMileage) {
        Booking booking = getBookingById(bookingId);
        Vehicle vehicle = booking.getVehicle();
        
        // Update vehicle mileage
        if (returnMileage != null) {
            vehicle.setMileage(returnMileage);
        }
        
        // Calculate possible early return refund if payment was made
        long bookedDays = ChronoUnit.DAYS.between(booking.getPickupDate(), booking.getReturnDate());
        if (bookedDays < 1) bookedDays = 1;
        
        long actualDays = ChronoUnit.DAYS.between(booking.getPickupDate(), LocalDate.now());
        if (actualDays < 1) actualDays = 1;

        if (actualDays < bookedDays) {
            long unusedDays = bookedDays - actualDays;
            
            BigDecimal dailyRate = vehicle.getDailyRate();
            BigDecimal refundRentalAmt = dailyRate.multiply(BigDecimal.valueOf(unusedDays));

            BigDecimal dailyExtra = BigDecimal.ZERO;
            if (Boolean.TRUE.equals(booking.getIncludeInsurance())) dailyExtra = dailyExtra.add(INSURANCE_PER_DAY);
            if (Boolean.TRUE.equals(booking.getIncludeGps())) dailyExtra = dailyExtra.add(GPS_PER_DAY);
            if (Boolean.TRUE.equals(booking.getIncludeChildSeat())) dailyExtra = dailyExtra.add(CHILD_SEAT_PER_DAY);
            if (booking.getAdditionalDrivers() != null && booking.getAdditionalDrivers() > 0) {
                dailyExtra = dailyExtra.add(ADDITIONAL_DRIVER_PER_DAY.multiply(BigDecimal.valueOf(booking.getAdditionalDrivers())));
            }
            BigDecimal refundExtraAmt = dailyExtra.multiply(BigDecimal.valueOf(unusedDays));
            BigDecimal totalRefund = refundRentalAmt.add(refundExtraAmt);

            // only refund if there's any SUCCESS payments to cover it
            List<Payment> successPayments = paymentRepository.findByBooking(booking).stream()
                    .filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCESS)
                    .collect(Collectors.toList());
            if (!successPayments.isEmpty() && totalRefund.compareTo(BigDecimal.ZERO) > 0) {
                Payment refund = new Payment();
                refund.setBooking(booking);
                refund.setAmount(totalRefund);
                refund.setPaymentType(Payment.PaymentType.REFUND);
                refund.setPaymentMethod(successPayments.get(0).getPaymentMethod());
                refund.setTransactionId("RFD-" + java.util.UUID.randomUUID().toString().substring(0, 12).toUpperCase());
                refund.setStatus(Payment.PaymentStatus.SUCCESS);
                refund.setPaymentDate(LocalDateTime.now());
                paymentRepository.save(refund);
            }
        }
        
        booking.setStatus(BookingStatus.COMPLETED);
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        bookingRepository.save(booking);
        vehicleRepository.save(vehicle);
        
        // Send completion email
        try {
            notificationService.sendBookingCompletion(booking);
        } catch (Exception e) {
            System.err.println("Error sending completion email: " + e.getMessage());
        }
    }

    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        booking.setStatus(BookingStatus.CANCELLED);
        
        // Restore vehicle availability
        Vehicle vehicle = booking.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepository.save(vehicle);
        
        // Handle refund logic: If 1/3 payment (advance) was received, record it as amount returned
        if (Boolean.TRUE.equals(booking.getAdvancePaid())) {
            booking.setAmountReturned(booking.getAdvanceAmount());
        }
        
        bookingRepository.save(booking);
        
        // Auto-refund any successful payments
        List<Payment> successfulPayments = paymentRepository.findByBooking(booking).stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCESS)
                .collect(Collectors.toList());

        for (Payment p : successfulPayments) {
            Payment refund = new Payment();
            refund.setBooking(booking);
            refund.setAmount(p.getAmount());
            refund.setPaymentType(Payment.PaymentType.REFUND);
            refund.setPaymentMethod(p.getPaymentMethod());
            refund.setTransactionId("RFD-" + java.util.UUID.randomUUID().toString().substring(0, 12).toUpperCase());
            refund.setStatus(Payment.PaymentStatus.SUCCESS);
            refund.setPaymentDate(LocalDateTime.now());
            paymentRepository.save(refund);
        }
        
        // Send cancellation email
        try {
            notificationService.sendBookingCancellation(booking);
        } catch (Exception e) {
            System.err.println("Error sending cancellation email: " + e.getMessage());
        }
    }

    private BigDecimal calculateRentalCost(Vehicle vehicle, long days) {
        if (days >= 30) {
            long months = days / 30;
            long remainingDays = days % 30;
            return vehicle.getMonthlyRate().multiply(BigDecimal.valueOf(months))
                    .add(vehicle.getDailyRate().multiply(BigDecimal.valueOf(remainingDays)));
        } else if (days >= 7) {
            long weeks = days / 7;
            long remainingDays = days % 7;
            return vehicle.getWeeklyRate().multiply(BigDecimal.valueOf(weeks))
                    .add(vehicle.getDailyRate().multiply(BigDecimal.valueOf(remainingDays)));
        } else {
            return vehicle.getDailyRate().multiply(BigDecimal.valueOf(days));
        }
    }
    
    /**
     * Calculate early booking discount based on days in advance
     */
    private BigDecimal calculateEarlyBookingDiscount(long daysInAdvance) {
        if (daysInAdvance >= 30) {
            return DISCOUNT_30_DAYS; // 15% off
        } else if (daysInAdvance >= 14) {
            return DISCOUNT_14_DAYS; // 10% off
        } else if (daysInAdvance >= 7) {
            return DISCOUNT_7_DAYS;  // 5% off
        }
        return BigDecimal.ZERO;
    }
    
    /**
     * Calculate loyalty discount based on number of completed bookings
     */
    private BigDecimal calculateLoyaltyDiscount(User customer) {
        long completedBookings = countCompletedBookings(customer.getId());
        
        if (completedBookings >= 5) {
            return LOYALTY_DISCOUNT_5_PLUS; // 15% off for 5+ bookings
        } else if (completedBookings >= 3) {
            return LOYALTY_DISCOUNT_3_4; // 10% off for 3-4 bookings
        } else if (completedBookings >= 1) {
            return LOYALTY_DISCOUNT_1_2; // 5% off for 1-2 bookings
        }
        return BigDecimal.ZERO;
    }
    
    /**
     * Count completed bookings for a customer
     */
    private long countCompletedBookings(Long customerId) {
        return bookingRepository.findByCustomer_IdAndStatus(customerId, BookingStatus.COMPLETED)
                .stream()
                .count();
    }
    
    /**
     * Calculate delivery fee based on distance and city rates
     */
    private BigDecimal calculateDeliveryFee(BookingDTO bookingDTO, City city) {
        if (bookingDTO.getDeliveryType() == null || 
            "PICKUP".equals(bookingDTO.getDeliveryType()) ||
            bookingDTO.getDeliveryDistance() == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal feePerKm = city.getDeliveryFeePerKm() != null ? 
                BigDecimal.valueOf(city.getDeliveryFeePerKm()) : new BigDecimal("15.00");
        BigDecimal distance = bookingDTO.getDeliveryDistance();
        
        // Minimum delivery fee of ₹100
        BigDecimal calculatedFee = feePerKm.multiply(distance).setScale(2, RoundingMode.HALF_UP);
        return calculatedFee.max(new BigDecimal("100.00"));
    }
    
    /**
     * Calculate extra charges (insurance, GPS, child seat, additional driver)
     */
    private BigDecimal calculateExtraCharges(BookingDTO bookingDTO, long days) {
        BigDecimal total = BigDecimal.ZERO;
        
        if (bookingDTO.getIncludeInsurance() != null && bookingDTO.getIncludeInsurance()) {
            total = total.add(INSURANCE_PER_DAY.multiply(BigDecimal.valueOf(days)));
        }
        if (bookingDTO.getIncludeGps() != null && bookingDTO.getIncludeGps()) {
            total = total.add(GPS_PER_DAY.multiply(BigDecimal.valueOf(days)));
        }
        if (bookingDTO.getIncludeChildSeat() != null && bookingDTO.getIncludeChildSeat()) {
            total = total.add(CHILD_SEAT_PER_DAY.multiply(BigDecimal.valueOf(days)));
        }
        if (bookingDTO.getAdditionalDrivers() != null && bookingDTO.getAdditionalDrivers() > 0) {
            total = total.add(ADDITIONAL_DRIVER_PER_DAY
                    .multiply(BigDecimal.valueOf(bookingDTO.getAdditionalDrivers()))
                    .multiply(BigDecimal.valueOf(days)));
        }
        
        return total.setScale(2, RoundingMode.HALF_UP);
    }
    
    /**
     * Get discount info for a given pickup date
     */
    public DiscountInfo getDiscountInfo(LocalDate pickupDate) {
        long daysInAdvance = ChronoUnit.DAYS.between(LocalDate.now(), pickupDate);
        BigDecimal discountRate = calculateEarlyBookingDiscount(daysInAdvance);
        int percentage = discountRate.multiply(BigDecimal.valueOf(100)).intValue();
        
        String message = percentage > 0 ? 
                "Early booking discount: " + percentage + "% off!" : 
                "Book 7+ days in advance for up to 15% discount!";
        
        return new DiscountInfo(percentage, message, daysInAdvance);
    }
    
    /**
     * Get loyalty discount info for a customer
     */
    public LoyaltyDiscountInfo getLoyaltyDiscountInfo(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        long completedBookings = countCompletedBookings(customerId);
        BigDecimal discountRate = calculateLoyaltyDiscount(customer);
        int percentage = discountRate.multiply(BigDecimal.valueOf(100)).intValue();
        
        String message;
        if (completedBookings >= 5) {
            message = "🌟 VIP Member! 15% loyalty discount applied!";
        } else if (completedBookings >= 3) {
            message = "⭐ Gold Member! 10% loyalty discount applied!";
        } else if (completedBookings >= 1) {
            message = "✨ Silver Member! 5% loyalty discount applied!";
        } else {
            message = "Complete your first booking to unlock loyalty discounts!";
        }
        
        return new LoyaltyDiscountInfo(percentage, message, completedBookings);
    }
    
    public record DiscountInfo(int percentage, String message, long daysInAdvance) {}
    public record LoyaltyDiscountInfo(int percentage, String message, long completedBookings) {}

    private BookingDTO convertToDTO(Booking booking) {
        Vehicle vehicle = booking.getVehicle();
        User customer = booking.getCustomer();
        
        UserDTO customerDTO = UserDTO.builder()
                .id(customer.getId())
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .email(customer.getEmail())
                .phoneNumber(customer.getPhoneNumber())
                .role(customer.getRole().toString())
                .build();
                
        // Minimal vehicle DTO for display
        VehicleDTO vehicleDTO = VehicleDTO.builder()
                .id(vehicle.getId())
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .registrationNumber(vehicle.getRegistrationNumber())
                .build();

        return BookingDTO.builder()
                .id(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .customerId(customer.getId())
                .vehicleId(vehicle.getId())
                .vehicleName(vehicle.getMake() + " " + vehicle.getModel())
                .vehicleImage(getVehicleImageUrl(vehicle))
                .cityName(booking.getCity().getName())
                .pickupDate(booking.getPickupDate())
                .returnDate(booking.getReturnDate())
                .pickupTime(booking.getPickupTime())
                .returnTime(booking.getReturnTime())
                .deliveryType(booking.getDeliveryType().toString())
                .deliveryLocation(booking.getDeliveryLocation())
                .deliveryFee(booking.getDeliveryFee())
                .deliveryDistance(booking.getDeliveryDistanceKm())
                .rentalCost(booking.getRentalAmount())
                .advanceFee(booking.getAdvanceAmount())
                .totalCost(booking.getTotalAmount())
                .status(booking.getStatus().toString())
                .advancePaid(booking.getAdvancePaid())
                .discountPercentage(booking.getDiscountPercentage())
                .discountAmount(booking.getDiscountAmount())
                .extraCharges(booking.getExtraCharges())
                .includeInsurance(booking.getIncludeInsurance())
                .includeGps(booking.getIncludeGps())
                .includeChildSeat(booking.getIncludeChildSeat())
                .additionalDrivers(booking.getAdditionalDrivers())
                .couponCode(booking.getCouponCode())
                .couponDiscount(booking.getCouponDiscount())
                .amountReturned(booking.getAmountReturned())
                .customer(customerDTO)
                .vehicle(vehicleDTO)
                .createdAt(booking.getCreatedAt())
                .build();
    }
    
    /**
     * Get the first exterior photo URL for a vehicle
     */
    private String getVehicleImageUrl(Vehicle vehicle) {
        if (vehicle.getPhotos() != null && !vehicle.getPhotos().isEmpty()) {
            // Priority 1: Primary photo
            java.util.Optional<String> primaryPhoto = vehicle.getPhotos().stream()
                    .filter(photo -> Boolean.TRUE.equals(photo.getIsPrimary()))
                    .map(VehiclePhoto::getPhotoUrl)
                    .findFirst();
            if (primaryPhoto.isPresent()) return primaryPhoto.get();

            // Priority 2: Exterior photo
            java.util.Optional<String> exteriorPhoto = vehicle.getPhotos().stream()
                    .filter(photo -> photo.getPhotoType() == VehiclePhoto.PhotoType.EXTERIOR)
                    .map(VehiclePhoto::getPhotoUrl)
                    .findFirst();
            if (exteriorPhoto.isPresent()) return exteriorPhoto.get();

            // Priority 3: First available photo
            return vehicle.getPhotos().get(0).getPhotoUrl();
        }
        return null;
    }
}
