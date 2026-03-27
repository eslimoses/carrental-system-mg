package com.carrental.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String password;
    private String role;
    private String city;
    private Boolean active;
    private String dateOfBirth;
    private String profilePhoto;
    private String licensePhotoFront;
    private String licensePhotoBack;
    private String address;
}
