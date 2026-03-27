package com.carrental.repository;

import com.carrental.entity.Bill;
import com.carrental.entity.Bill.BillStatus;
import com.carrental.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByBooking(Booking booking);
    List<Bill> findByStatus(BillStatus status);
}
