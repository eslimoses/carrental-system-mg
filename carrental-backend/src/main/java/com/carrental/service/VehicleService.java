package com.carrental.service;

import com.carrental.dto.VehicleDTO;
import com.carrental.entity.City;
import com.carrental.entity.Vehicle;
import com.carrental.entity.VehicleCategory;
import com.carrental.entity.Vehicle.VehicleStatus;
import com.carrental.repository.CityRepository;
import com.carrental.repository.VehicleCategoryRepository;
import com.carrental.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.carrental.entity.VehiclePhoto;

@Service
@RequiredArgsConstructor
@Transactional
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final CityRepository cityRepository;
    private final VehicleCategoryRepository categoryRepository;

    public Vehicle createVehicle(VehicleDTO vehicleDTO) {
        if (vehicleRepository.findByRegistrationNumber(vehicleDTO.getRegistrationNumber()).isPresent()) {
            throw new RuntimeException("Vehicle with this registration number already exists");
        }

        City city = cityRepository.findById(vehicleDTO.getCityId())
                .orElseThrow(() -> new RuntimeException("City not found"));
        VehicleCategory category = categoryRepository.findById(vehicleDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Vehicle vehicle = new Vehicle();
        vehicle.setMake(vehicleDTO.getMake());
        vehicle.setModel(vehicleDTO.getModel());
        vehicle.setYear(vehicleDTO.getYear());
        vehicle.setRegistrationNumber(vehicleDTO.getRegistrationNumber());
        vehicle.setColor(vehicleDTO.getColor());
        vehicle.setMileage(vehicleDTO.getMileage());
        vehicle.setFuelType(vehicleDTO.getFuelType());
        vehicle.setTransmission(vehicleDTO.getTransmission());
        vehicle.setSeatingCapacity(vehicleDTO.getSeatingCapacity());
        vehicle.setDailyRate(BigDecimal.valueOf(vehicleDTO.getDailyRate()));
        vehicle.setWeeklyRate(BigDecimal.valueOf(vehicleDTO.getWeeklyRate()));
        vehicle.setMonthlyRate(BigDecimal.valueOf(vehicleDTO.getMonthlyRate()));
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicle.setCity(city);
        vehicle.setCategory(category);
        vehicle.setVehicleCondition(vehicleDTO.getVehicleCondition());
        vehicle.setInsuranceValidTill(vehicleDTO.getInsuranceValidTill());
        vehicle.setRegistrationValidTill(vehicleDTO.getRegistrationValidTill());
        vehicle.setDescription(vehicleDTO.getDescription());
        vehicle.setMaintenanceWorkRequired(vehicleDTO.getMaintenanceWorkRequired());
        vehicle.setMaintenanceSchedule(vehicleDTO.getMaintenanceSchedule());

        // Handle image URL if provided
        if (vehicleDTO.getImageUrl() != null && !vehicleDTO.getImageUrl().isEmpty()) {
            VehiclePhoto photo = new VehiclePhoto();
            photo.setVehicle(vehicle);
            photo.setPhotoUrl(vehicleDTO.getImageUrl());
            photo.setPhotoType(VehiclePhoto.PhotoType.EXTERIOR);
            photo.setIsPrimary(true);
            vehicle.setPhotos(new ArrayList<>(List.of(photo)));
        }

        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, VehicleDTO vehicleDTO) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (vehicleDTO.getMake() != null) vehicle.setMake(vehicleDTO.getMake());
        if (vehicleDTO.getModel() != null) vehicle.setModel(vehicleDTO.getModel());
        if (vehicleDTO.getYear() != null) vehicle.setYear(vehicleDTO.getYear());
        if (vehicleDTO.getColor() != null) vehicle.setColor(vehicleDTO.getColor());
        if (vehicleDTO.getMileage() != null) vehicle.setMileage(vehicleDTO.getMileage());
        if (vehicleDTO.getFuelType() != null) vehicle.setFuelType(vehicleDTO.getFuelType());
        if (vehicleDTO.getTransmission() != null) vehicle.setTransmission(vehicleDTO.getTransmission());
        if (vehicleDTO.getSeatingCapacity() != null) vehicle.setSeatingCapacity(vehicleDTO.getSeatingCapacity());
        if (vehicleDTO.getDailyRate() != null) vehicle.setDailyRate(BigDecimal.valueOf(vehicleDTO.getDailyRate()));
        if (vehicleDTO.getWeeklyRate() != null) vehicle.setWeeklyRate(BigDecimal.valueOf(vehicleDTO.getWeeklyRate()));
        if (vehicleDTO.getMonthlyRate() != null) vehicle.setMonthlyRate(BigDecimal.valueOf(vehicleDTO.getMonthlyRate()));
        if (vehicleDTO.getStatus() != null) vehicle.setStatus(VehicleStatus.valueOf(vehicleDTO.getStatus()));
        if (vehicleDTO.getRegistrationNumber() != null) vehicle.setRegistrationNumber(vehicleDTO.getRegistrationNumber());
        if (vehicleDTO.getVehicleCondition() != null) vehicle.setVehicleCondition(vehicleDTO.getVehicleCondition());
        if (vehicleDTO.getInsuranceValidTill() != null) vehicle.setInsuranceValidTill(vehicleDTO.getInsuranceValidTill());
        if (vehicleDTO.getRegistrationValidTill() != null) vehicle.setRegistrationValidTill(vehicleDTO.getRegistrationValidTill());
        if (vehicleDTO.getDescription() != null) vehicle.setDescription(vehicleDTO.getDescription());
        if (vehicleDTO.getMaintenanceWorkRequired() != null) vehicle.setMaintenanceWorkRequired(vehicleDTO.getMaintenanceWorkRequired());
        if (vehicleDTO.getMaintenanceSchedule() != null) vehicle.setMaintenanceSchedule(vehicleDTO.getMaintenanceSchedule());

        if (vehicleDTO.getCityId() != null) {
            City city = cityRepository.findById(vehicleDTO.getCityId())
                    .orElseThrow(() -> new RuntimeException("City not found"));
            vehicle.setCity(city);
        }
        if (vehicleDTO.getCategoryId() != null) {
            VehicleCategory category = categoryRepository.findById(vehicleDTO.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            vehicle.setCategory(category);
        }

        // Handle image URL updates
        if (vehicleDTO.getImageUrl() != null && !vehicleDTO.getImageUrl().isEmpty()) {
            if (vehicle.getPhotos() == null) {
                vehicle.setPhotos(new ArrayList<>());
            }
            
            boolean updated = false;
            for (VehiclePhoto photo : vehicle.getPhotos()) {
                if (Boolean.TRUE.equals(photo.getIsPrimary())) {
                    photo.setPhotoUrl(vehicleDTO.getImageUrl());
                    updated = true;
                    break;
                }
            }
            
            if (!updated) {
                VehiclePhoto photo = new VehiclePhoto();
                photo.setVehicle(vehicle);
                photo.setPhotoUrl(vehicleDTO.getImageUrl());
                photo.setPhotoType(VehiclePhoto.PhotoType.EXTERIOR);
                photo.setIsPrimary(true);
                vehicle.getPhotos().add(photo);
            }
        }

        return vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new RuntimeException("Vehicle not found");
        }
        vehicleRepository.deleteById(id);
    }

    public List<VehicleDTO> getAllVehicles() {
        return vehicleRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
    }

    public List<VehicleDTO> getVehiclesByCity(Long cityId) {
        return vehicleRepository.findByCity_Id(cityId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<VehicleDTO> getAvailableVehiclesByCity(Long cityId) {
        return vehicleRepository.findByCity_IdAndStatus(cityId, VehicleStatus.AVAILABLE)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<VehicleDTO> getAvailableVehiclesByCityAndCategory(Long cityId, Long categoryId) {
        return vehicleRepository.findAvailableVehiclesByCityAndCategory(cityId, categoryId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<VehicleDTO> searchVehicles(String cityName, String categoryName, String transmission,
                                           Double minPrice, Double maxPrice) {
        return vehicleRepository.findAll()
                .stream()
                .filter(v -> cityName == null || cityName.isEmpty() || "All".equalsIgnoreCase(cityName) 
                        || v.getCity().getName().equalsIgnoreCase(cityName))
                .filter(v -> categoryName == null || categoryName.isEmpty() || "All".equalsIgnoreCase(categoryName) 
                        || v.getCategory().getName().equalsIgnoreCase(categoryName))
                .filter(v -> transmission == null || transmission.isEmpty() || "All".equalsIgnoreCase(transmission) 
                        || v.getTransmission().equalsIgnoreCase(transmission))
                .filter(v -> minPrice == null || v.getDailyRate().doubleValue() >= minPrice)
                .filter(v -> maxPrice == null || v.getDailyRate().doubleValue() <= maxPrice)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void updateVehicleStatus(Long vehicleId, VehicleStatus status) {
        Vehicle vehicle = getVehicleById(vehicleId);
        vehicle.setStatus(status);
        vehicleRepository.save(vehicle);
    }

    public void updateVehicleMileage(Long vehicleId, Integer newMileage) {
        Vehicle vehicle = getVehicleById(vehicleId);
        vehicle.setMileage(newMileage);
        vehicleRepository.save(vehicle);
    }

    private VehicleDTO convertToDTO(Vehicle vehicle) {
        List<String> photoUrls = vehicle.getPhotos() != null ? vehicle.getPhotos().stream()
                .map(photo -> photo.getPhotoUrl())
                .collect(Collectors.toList()) : List.of();
        
        // Get the primary image URL or first available, or use a placeholder
        String imageUrl = vehicle.getPhotos() != null ? vehicle.getPhotos().stream()
                .filter(photo -> photo.getIsPrimary() != null && photo.getIsPrimary())
                .map(photo -> photo.getPhotoUrl())
                .findFirst()
                .orElse(photoUrls.isEmpty() ? 
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop" : 
                    photoUrls.get(0))
                : "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop";
        
        return VehicleDTO.builder()
                .id(vehicle.getId())
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .registrationNumber(vehicle.getRegistrationNumber())
                .color(vehicle.getColor())
                .mileage(vehicle.getMileage())
                .fuelType(vehicle.getFuelType())
                .transmission(vehicle.getTransmission())
                .seatingCapacity(vehicle.getSeatingCapacity())
                .dailyRate(vehicle.getDailyRate().doubleValue())
                .weeklyRate(vehicle.getWeeklyRate().doubleValue())
                .monthlyRate(vehicle.getMonthlyRate().doubleValue())
                .status(vehicle.getStatus().toString())
                .cityId(vehicle.getCity().getId())
                .cityName(vehicle.getCity().getName())
                .categoryId(vehicle.getCategory().getId())
                .photoUrls(photoUrls)
                .imageUrl(imageUrl)
                .type(vehicle.getCategory().getName())
                .pricePerDay(vehicle.getDailyRate().doubleValue())
                .available(vehicle.getStatus() == VehicleStatus.AVAILABLE)
                .vehicleCondition(vehicle.getVehicleCondition())
                .insuranceValidTill(vehicle.getInsuranceValidTill())
                .registrationValidTill(vehicle.getRegistrationValidTill())
                .description(vehicle.getDescription())
                .maintenanceWorkRequired(vehicle.getMaintenanceWorkRequired())
                .maintenanceSchedule(vehicle.getMaintenanceSchedule())
                .build();
    }
}
