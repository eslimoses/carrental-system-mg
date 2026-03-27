package com.carrental.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "rental_photos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentalPhoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    private String photoUrl;

    @Enumerated(EnumType.STRING)
    private PhotoType photoType;

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum PhotoType {
        PICKUP_EXTERIOR, PICKUP_INTERIOR, RETURN_EXTERIOR, RETURN_INTERIOR, OTHER
    }
}
