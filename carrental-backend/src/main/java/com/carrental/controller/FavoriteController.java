package com.carrental.controller;

import com.carrental.entity.Favorite;
import com.carrental.entity.Vehicle;
import com.carrental.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FavoriteController {
    private final FavoriteService favoriteService;

    @PostMapping("/{userId}/{vehicleId}")
    public ResponseEntity<?> addFavorite(@PathVariable Long userId, @PathVariable Long vehicleId) {
        System.out.println("🚀 [API] HIT: ADD FAVORITE - User: " + userId + ", Vehicle: " + vehicleId);
        try {
            Favorite favorite = favoriteService.addFavorite(userId, vehicleId);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Vehicle added to favorites");
            response.put("favorite", favorite);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ [API] FAILED ADD FAVORITE: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{userId}/{vehicleId}")
    public ResponseEntity<?> removeFavorite(@PathVariable Long userId, @PathVariable Long vehicleId) {
        System.out.println("🚀 [API] HIT: REMOVE FAVORITE - User: " + userId + ", Vehicle: " + vehicleId);
        try {
            favoriteService.removeFavorite(userId, vehicleId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Vehicle removed from favorites");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ [API] FAILED REMOVE FAVORITE: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserFavorites(@PathVariable Long userId) {
        try {
            List<Favorite> favorites = favoriteService.getUserFavorites(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("favorites", favorites);
            response.put("count", favorites.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user/{userId}/vehicles")
    public ResponseEntity<?> getUserFavoriteVehicles(@PathVariable Long userId) {
        try {
            List<Vehicle> vehicles = favoriteService.getUserFavoriteVehicles(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("vehicles", vehicles);
            response.put("count", vehicles.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/check/{userId}/{vehicleId}")
    public ResponseEntity<?> isFavorite(@PathVariable Long userId, @PathVariable Long vehicleId) {
        try {
            boolean isFavorite = favoriteService.isFavorite(userId, vehicleId);
            Map<String, Object> response = new HashMap<>();
            response.put("isFavorite", isFavorite);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
