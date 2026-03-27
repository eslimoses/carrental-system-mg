package com.carrental.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_photos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehiclePhoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Vehicle vehicle;

    private String photoUrl;

    @Enumerated(EnumType.STRING)
    private PhotoType photoType;

    private Boolean isPrimary = false;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum PhotoType {
        EXTERIOR, INTERIOR, OTHER
    }
}
