package com.carrental.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDTO {
    private Long id;
    private String make;
    private String model;
    private Integer year;
    private String registrationNumber;
    private String color;
    private Integer mileage;
    private String fuelType;
    private String transmission;
    private Integer seatingCapacity;
    private Double dailyRate;
    private Double weeklyRate;
    private Double monthlyRate;
    private String status;
    private Long cityId;
    private String cityName;
    private Long categoryId;
    private List<String> photoUrls;
    private String imageUrl;
    private String type;
    private Double pricePerDay;
    private Boolean available;
    private String vehicleCondition;
    private java.time.LocalDate insuranceValidTill;
    private java.time.LocalDate registrationValidTill;
    private String description;
    private String maintenanceWorkRequired;
    private String maintenanceSchedule;
}
