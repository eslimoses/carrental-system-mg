package com.carrental.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Booking booking;

    @Column(unique = true, nullable = false)
    private String billNumber;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"password", "bookings"})
    private User customer;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"photos", "admin"})
    private Vehicle vehicle;

    private Integer rentalDays;
    private BigDecimal dailyRate;
    private BigDecimal rentalAmount;
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    private Integer extraKm = 0;
    private BigDecimal extraKmRate;
    private BigDecimal extraKmCharge = BigDecimal.ZERO;

    private Integer extraDays = 0;
    private BigDecimal extraDaysRate;
    private BigDecimal extraDaysCharge = BigDecimal.ZERO;
    
    // Extra options charges (insurance, GPS, child seat, etc.)
    private BigDecimal extraOptionsCharge = BigDecimal.ZERO;
    
    // Discount info
    private Integer discountPercentage = 0;
    private BigDecimal discountAmount = BigDecimal.ZERO;

    private BigDecimal advanceAmount;
    private BigDecimal advancePaid = BigDecimal.ZERO;
    private BigDecimal balanceAmount;
    private BigDecimal totalAmount;

    private LocalDateTime billDate;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('DRAFT', 'SENT', 'PAID', 'PARTIAL_PAID') DEFAULT 'DRAFT'")
    private BillStatus status = BillStatus.DRAFT;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum BillStatus {
        DRAFT, SENT, PAID, PARTIAL_PAID
    }
}
