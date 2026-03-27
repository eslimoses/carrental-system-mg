package com.carrental.repository;

import com.carrental.entity.Booking;
import com.carrental.entity.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomer_Id(Long customerId);
    List<Booking> findByVehicle_Id(Long vehicleId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByVehicle_IdAndStatus(Long vehicleId, BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.vehicle.id = :vehicleId AND b.status IN ('CONFIRMED', 'ACTIVE') AND " +
           "((b.pickupDate <= :endDate AND b.returnDate >= :startDate))")
    List<Booking> findConflictingBookings(@Param("vehicleId") Long vehicleId, 
                                          @Param("startDate") java.time.LocalDate startDate,
                                          @Param("endDate") java.time.LocalDate endDate);
    
    List<Booking> findByCustomer_IdOrderByCreatedAtDesc(Long customerId);
    
    List<Booking> findByCustomer_IdAndStatus(Long customerId, BookingStatus status);
    
    @Query("SELECT b FROM Booking b JOIN FETCH b.customer JOIN FETCH b.vehicle ORDER BY b.createdAt DESC")
    List<Booking> findAllWithDetails();
    
    @Query("SELECT b FROM Booking b JOIN FETCH b.customer JOIN FETCH b.vehicle")
    List<Booking> findTop10ByOrderByCreatedAtDesc();
    
    boolean existsByCustomer_IdAndCouponCode(Long customerId, String couponCode);
    
    List<Booking> findByCity_Id(Long cityId);
}
