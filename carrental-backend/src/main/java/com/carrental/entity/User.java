package com.carrental.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String dateOfBirth;
    
    @Column(columnDefinition = "LONGTEXT")
    private String licensePhotoFront;
    
    @Column(columnDefinition = "LONGTEXT")
    private String licensePhotoBack;
    
    @Column(columnDefinition = "LONGTEXT")
    private String profilePhoto;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('CUSTOMER', 'ADMIN', 'SUPER_ADMIN') DEFAULT 'CUSTOMER'")
    private UserRole role = UserRole.CUSTOMER;

    private String city;
    private String address;

    @Column(name = "is_active", columnDefinition = "BOOLEAN DEFAULT TRUE", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum UserRole {
        CUSTOMER, ADMIN, SUPER_ADMIN
    }
}
