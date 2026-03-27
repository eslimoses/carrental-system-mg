package com.carrental.controller;

import com.carrental.entity.MaintenanceRecord;
import com.carrental.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/maintenance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MaintenanceController {
    private final MaintenanceService maintenanceService;

    @GetMapping
    public ResponseEntity<List<MaintenanceRecord>> getAll() {
        return ResponseEntity.ok(maintenanceService.getAll());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<MaintenanceRecord>> getByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(maintenanceService.getByVehicle(vehicleId));
    }

    @PostMapping
    public ResponseEntity<MaintenanceRecord> create(@RequestBody MaintenanceRecord record) {
        return ResponseEntity.ok(maintenanceService.createRecord(record));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceRecord> update(@PathVariable Long id, @RequestBody MaintenanceRecord record) {
        return ResponseEntity.ok(maintenanceService.updateRecord(id, record));
    }
}
