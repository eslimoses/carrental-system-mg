package com.carrental.repository;

import com.carrental.entity.RentalPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalPhotoRepository extends JpaRepository<RentalPhoto, Long> {
    List<RentalPhoto> findByBookingId(Long bookingId);
    List<RentalPhoto> findByBookingIdAndPhotoType(Long bookingId, String photoType);
}
