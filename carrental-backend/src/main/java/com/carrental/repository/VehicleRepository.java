package com.carrental.repository;

import com.carrental.entity.Vehicle;
import com.carrental.entity.Vehicle.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByCity_Id(Long cityId);
    List<Vehicle> findByCity_IdAndStatus(Long cityId, VehicleStatus status);
    List<Vehicle> findByCategoryId(Long categoryId);
    List<Vehicle> findByCityIdAndCategoryId(Long cityId, Long categoryId);
    List<Vehicle> findByCityIdAndCategoryIdAndStatus(Long cityId, Long categoryId, VehicleStatus status);
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);
    
    @Query("SELECT v FROM Vehicle v WHERE v.city.id = :cityId AND v.status = 'AVAILABLE' AND v.category.id = :categoryId")
    List<Vehicle> findAvailableVehiclesByCityAndCategory(@Param("cityId") Long cityId, @Param("categoryId") Long categoryId);
    
    List<Vehicle> findByStatus(VehicleStatus status);
    long countByStatus(VehicleStatus status);
}
