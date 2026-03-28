package com.carrental.controller;

import com.carrental.entity.City;
import com.carrental.repository.CityRepository;
import com.carrental.repository.VehicleRepository;
import com.carrental.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cities")
@RequiredArgsConstructor
public class CityController {
    private final CityRepository cityRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;

    @GetMapping
    public ResponseEntity<List<City>> getAllCities() {
        return ResponseEntity.ok(cityRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<City> getCityById(@PathVariable Long id) {
        return cityRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCity(@RequestBody City city) {
        try {
            if (city.getCreatedAt() == null) {
                city.setCreatedAt(LocalDateTime.now());
            }
            return ResponseEntity.ok(cityRepository.save(city));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create city: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCity(@PathVariable Long id, @RequestBody City cityDetails) {
        return cityRepository.findById(id)
                .map(city -> {
                    city.setName(cityDetails.getName());
                    if (cityDetails.getState() != null) city.setState(cityDetails.getState());
                    if (cityDetails.getLatitude() != null) city.setLatitude(cityDetails.getLatitude());
                    if (cityDetails.getLongitude() != null) city.setLongitude(cityDetails.getLongitude());
                    if (cityDetails.getDeliveryFeePerKm() != null) city.setDeliveryFeePerKm(cityDetails.getDeliveryFeePerKm());
                    return ResponseEntity.ok((Object) cityRepository.save(city));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCity(@PathVariable Long id) {
        if (!cityRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        // Check if any vehicles or bookings reference this city
        long vehicleCount = vehicleRepository.findByCity_Id(id).size();
        long bookingCount = bookingRepository.findByCity_Id(id).size();
        if (vehicleCount > 0 || bookingCount > 0) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Cannot delete city: it has " + vehicleCount + " vehicle(s) and " + bookingCount + " booking(s) linked to it. Please reassign or remove them first."
            ));
        }
        try {
            cityRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete city: " + e.getMessage()));
        }
    }
}
