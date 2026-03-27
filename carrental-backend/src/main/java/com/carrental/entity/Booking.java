package com.carrental.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String bookingNumber;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"password", "bookings"})
    private User customer;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"photos", "admin"})
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    private LocalDate pickupDate;
    private LocalDate returnDate;
    private LocalTime pickupTime;
    private LocalTime returnTime;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING'")
    private BookingStatus status = BookingStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('PICKUP', 'HOME_DELIVERY') DEFAULT 'PICKUP'")
    private DeliveryType deliveryType = DeliveryType.PICKUP;

    private String deliveryLocation;
    private BigDecimal deliveryDistanceKm;
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    private BigDecimal advanceAmount;
    private BigDecimal rentalAmount;
    private BigDecimal extraKmCharge = BigDecimal.ZERO;
    private BigDecimal extraDaysCharge = BigDecimal.ZERO;
    private BigDecimal extraCharges = BigDecimal.ZERO;
    private BigDecimal totalAmount;
    private BigDecimal amountReturned = BigDecimal.ZERO;
    
    // Early booking discount
    private Integer discountPercentage = 0;
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    // Coupon info
    private String couponCode;
    private BigDecimal couponDiscount = BigDecimal.ZERO;
    
    // Extra options
    private Boolean includeInsurance = false;
    private Boolean includeGps = false;
    private Boolean includeChildSeat = false;
    private Integer additionalDrivers = 0;

    private Boolean advancePaid = false;
    private LocalDateTime advancePaidDate;

    private Boolean rentalPaid = false;
    private LocalDateTime rentalPaidDate;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RentalPhoto> rentalPhotos;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum BookingStatus {
        PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELLED
    }

    public enum DeliveryType {
        PICKUP, HOME_DELIVERY
    }
}
