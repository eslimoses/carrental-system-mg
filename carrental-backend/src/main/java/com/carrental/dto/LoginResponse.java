package com.carrental.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String role;
    private String city;
    private boolean active;
    private String dateOfBirth;
    private String profilePhoto;
    private String licensePhotoFront;
    private String licensePhotoBack;
    private String address;
    private String token;
    private String message;
}
