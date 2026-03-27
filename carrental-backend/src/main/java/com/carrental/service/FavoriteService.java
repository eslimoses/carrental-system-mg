package com.carrental.service;

import com.carrental.entity.Favorite;
import com.carrental.entity.User;
import com.carrental.entity.Vehicle;
import com.carrental.repository.FavoriteRepository;
import com.carrental.repository.UserRepository;
import com.carrental.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    public Favorite addFavorite(Long userId, Long vehicleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // Check if already favorited
        if (favoriteRepository.existsByUserIdAndVehicleId(userId, vehicleId)) {
            throw new RuntimeException("Vehicle already in favorites");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setVehicle(vehicle);
        return favoriteRepository.save(favorite);
    }

    public void removeFavorite(Long userId, Long vehicleId) {
        favoriteRepository.deleteByUserIdAndVehicleId(userId, vehicleId);
    }

    public List<Favorite> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId);
    }

    public boolean isFavorite(Long userId, Long vehicleId) {
        return favoriteRepository.existsByUserIdAndVehicleId(userId, vehicleId);
    }

    public List<Vehicle> getUserFavoriteVehicles(Long userId) {
        return favoriteRepository.findByUserId(userId)
                .stream()
                .map(Favorite::getVehicle)
                .collect(Collectors.toList());
    }
}
