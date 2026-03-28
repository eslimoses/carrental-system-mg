package com.carrental.controller;

import com.carrental.dto.VehicleDTO;
import com.carrental.entity.Vehicle;
import com.carrental.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {
    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<List<VehicleDTO>> getAllVehicles() {
        try {
            var vehicles = vehicleService.getAllVehicles();
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    @PostMapping
    public ResponseEntity<?> createVehicle(@RequestBody VehicleDTO vehicleDTO) {
        try {
            var vehicle = vehicleService.createVehicle(vehicleDTO);
            return ResponseEntity.ok(vehicle);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicle(@PathVariable Long id) {
        try {
            var vehicles = vehicleService.getAllVehicles();
            var vehicle = vehicles.stream().filter(v -> v.getId().equals(id)).findFirst()
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            return ResponseEntity.ok(vehicle);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVehicle(@PathVariable Long id, @RequestBody VehicleDTO vehicleDTO) {
        try {
            var vehicle = vehicleService.updateVehicle(id, vehicleDTO);
            return ResponseEntity.ok(vehicle);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        try {
            vehicleService.deleteVehicle(id);
            return ResponseEntity.ok("Vehicle deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/city/{cityId}")
    public ResponseEntity<List<VehicleDTO>> getVehiclesByCity(@PathVariable Long cityId) {
        return ResponseEntity.ok(vehicleService.getVehiclesByCity(cityId));
    }

    @GetMapping("/city/{cityId}/available")
    public ResponseEntity<List<VehicleDTO>> getAvailableVehiclesByCity(@PathVariable Long cityId) {
        return ResponseEntity.ok(vehicleService.getAvailableVehiclesByCity(cityId));
    }

    @GetMapping("/city/{cityId}/category/{categoryId}/available")
    public ResponseEntity<List<VehicleDTO>> getAvailableVehiclesByCityAndCategory(
            @PathVariable Long cityId,
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(vehicleService.getAvailableVehiclesByCityAndCategory(cityId, categoryId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<VehicleDTO>> searchVehicles(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        return ResponseEntity.ok(vehicleService.searchVehicles(city, category, transmission, minPrice, maxPrice));
    }
}
