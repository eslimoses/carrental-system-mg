package com.carrental.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Enumerated(EnumType.STRING)
    private MaintenanceType type;

    private String description;
    
    private LocalDate serviceDate;
    private LocalDate nextServiceDate;
    
    private Integer mileageAtService;
    private BigDecimal cost = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum MaintenanceType {
        ROUTINE_CHECK, ENGINE_REPAIR, OIL_CHANGE, TIRE_REPLACEMENT, BRAKE_SERVICE, ACCIDENT_REPAIR, OTHER
    }

    public enum MaintenanceStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    }
}
