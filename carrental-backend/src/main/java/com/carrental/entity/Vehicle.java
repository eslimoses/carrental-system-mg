package com.carrental.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String registrationNumber;

    private String make;
    private String model;
    private Integer year;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private VehicleCategory category;

    @ManyToOne
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @ManyToOne
    @JoinColumn(name = "admin_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"password", "bookings"})
    private User admin;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('AVAILABLE', 'RENTED', 'MAINTENANCE') DEFAULT 'AVAILABLE'")
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    private BigDecimal dailyRate;
    private BigDecimal weeklyRate;
    private BigDecimal monthlyRate;

    private String color;
    private String fuelType;
    private String transmission;
    private Integer seatingCapacity;
    private Integer mileage = 0;
    private String vehicleCondition;

    private LocalDate insuranceValidTill;
    private LocalDate registrationValidTill;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String maintenanceWorkRequired;

    @Column(columnDefinition = "TEXT")
    private String maintenanceSchedule;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VehiclePhoto> photos;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum VehicleStatus {
        AVAILABLE, RENTED, MAINTENANCE
    }
}
