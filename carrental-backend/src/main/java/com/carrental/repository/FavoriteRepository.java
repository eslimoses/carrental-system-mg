package com.carrental.repository;

import com.carrental.entity.Favorite;
import com.carrental.entity.User;
import com.carrental.entity.Vehicle;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUser(User user);
    List<Favorite> findByUserId(Long userId);
    Optional<Favorite> findByUserAndVehicle(User user, Vehicle vehicle);
    Optional<Favorite> findByUserIdAndVehicleId(Long userId, Long vehicleId);
    @Modifying
    @Transactional
    void deleteByUserAndVehicle(User user, Vehicle vehicle);

    @Modifying
    @Transactional
    void deleteByUserIdAndVehicleId(Long userId, Long vehicleId);
    boolean existsByUserIdAndVehicleId(Long userId, Long vehicleId);
}
