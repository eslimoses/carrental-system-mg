package com.carrental.controller;

import com.carrental.entity.RentalPhoto;
import com.carrental.entity.VehiclePhoto;
import com.carrental.repository.RentalPhotoRepository;
import com.carrental.repository.VehiclePhotoRepository;
import com.carrental.repository.VehicleRepository;
import com.carrental.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor

public class PhotoController {
    private final VehiclePhotoRepository vehiclePhotoRepository;
    private final RentalPhotoRepository rentalPhotoRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/vehicle/{vehicleId}")
    public ResponseEntity<?> uploadVehiclePhoto(
            @PathVariable Long vehicleId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") Boolean isPrimary) {
        try {
            var vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));

            String fileName = saveFile(file, "vehicles");

            VehiclePhoto photo = new VehiclePhoto();
            photo.setVehicle(vehicle);
            photo.setPhotoUrl("/uploads/vehicles/" + fileName);
            photo.setIsPrimary(isPrimary);
            photo.setUploadedAt(LocalDateTime.now());

            return ResponseEntity.ok(vehiclePhotoRepository.save(photo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/rental/{bookingId}")
    public ResponseEntity<?> uploadRentalPhoto(
            @PathVariable Long bookingId,
            @RequestParam("file") MultipartFile file,
            @RequestParam String photoType) {
        try {
            var booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            String fileName = saveFile(file, "rentals");

            RentalPhoto photo = new RentalPhoto();
            photo.setBooking(booking);
            photo.setPhotoUrl("/uploads/rentals/" + fileName);
            photo.setPhotoType(RentalPhoto.PhotoType.valueOf(photoType.toUpperCase()));
            photo.setUploadedAt(LocalDateTime.now());

            return ResponseEntity.ok(rentalPhotoRepository.save(photo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<VehiclePhoto>> getVehiclePhotos(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(vehiclePhotoRepository.findByVehicleId(vehicleId));
    }

    @GetMapping("/rental/{bookingId}")
    public ResponseEntity<List<RentalPhoto>> getRentalPhotos(@PathVariable Long bookingId) {
        return ResponseEntity.ok(rentalPhotoRepository.findByBookingId(bookingId));
    }

    @DeleteMapping("/{photoId}")
    public ResponseEntity<Void> deleteVehiclePhoto(@PathVariable Long photoId) {
        vehiclePhotoRepository.deleteById(photoId);
        return ResponseEntity.ok().build();
    }

    private String saveFile(MultipartFile file, String subDir) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR + subDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String fileName = UUID.randomUUID().toString() + extension;

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        return fileName;
    }
}
