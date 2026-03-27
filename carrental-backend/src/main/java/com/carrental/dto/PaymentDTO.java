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
public class PaymentDTO {
    private Long id;
    private Long bookingId;
    private BigDecimal amount;
    private String paymentType;
    private String paymentMethod;
    private String transactionId;
    private String status;
    private LocalDateTime paymentDate;
}
