package com.carrental.repository;

import com.carrental.entity.Booking;
import com.carrental.entity.Payment;
import com.carrental.entity.Payment.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBooking(Booking booking);
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findByStatus(PaymentStatus status);
    List<Payment> findByBookingAndStatus(Booking booking, PaymentStatus status);
    List<Payment> findByBooking_Customer_IdOrderByPaymentDateDesc(Long customerId);
}
