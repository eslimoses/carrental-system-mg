package com.carrental.repository;

import com.carrental.entity.VehiclePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehiclePhotoRepository extends JpaRepository<VehiclePhoto, Long> {
    List<VehiclePhoto> findByVehicleId(Long vehicleId);
    List<VehiclePhoto> findByVehicleIdAndPhotoType(Long vehicleId, String photoType);
}
