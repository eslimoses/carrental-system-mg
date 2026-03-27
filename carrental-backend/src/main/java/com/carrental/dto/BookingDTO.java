package com.carrental.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long id;
    private Long customerId;
    private Long vehicleId;
    private LocalDate pickupDate;
    private LocalDate returnDate;
    private LocalTime pickupTime;
    private LocalTime returnTime;
    private String deliveryType;
    private String deliveryLocation;
    private BigDecimal deliveryFee;
    private BigDecimal deliveryDistance;
    private BigDecimal rentalCost;
    private BigDecimal advanceFee;
    private BigDecimal totalCost;
    private String status;
    private Boolean advancePaid;
    private BigDecimal amountReturned;
    
    // Extra charges options
    private Boolean includeInsurance;
    private Boolean includeGps;
    private Boolean includeChildSeat;
    private Integer additionalDrivers;
    private BigDecimal extraCharges;
    
    // Discount info
    private Integer discountPercentage;
    private BigDecimal discountAmount;
    
    // Coupon info
    private String couponCode;
    private BigDecimal couponDiscount;
    
    // Vehicle info for display
    private String vehicleName;
    private String vehicleImage;
    private String cityName;
    private String bookingNumber;
    
    // Nested details for activity stream
    private UserDTO customer;
    private VehicleDTO vehicle;
    private java.time.LocalDateTime createdAt;
}
