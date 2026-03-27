package com.carrental.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillDTO {
    private Long id;
    private Long bookingId;
    private Long customerId;
    private Long vehicleId;
    private BigDecimal rentalCost;
    private BigDecimal deliveryFee;
    private BigDecimal extraCharges;
    private BigDecimal advancePaid;
    private BigDecimal totalAmount;
    private BigDecimal amountDue;
    private String status;
    private LocalDateTime billDate;
}
