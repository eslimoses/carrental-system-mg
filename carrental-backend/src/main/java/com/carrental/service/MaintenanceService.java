package com.carrental.service;

import com.carrental.entity.MaintenanceRecord;
import com.carrental.entity.Vehicle;
import com.carrental.repository.MaintenanceRecordRepository;
import com.carrental.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MaintenanceService {
    private final MaintenanceRecordRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;

    public MaintenanceRecord createRecord(MaintenanceRecord record) {
        // If status is IN_PROGRESS, mark vehicle as MAINTENANCE
        if (record.getStatus() == MaintenanceRecord.MaintenanceStatus.IN_PROGRESS) {
            Vehicle vehicle = record.getVehicle();
            vehicle.setStatus(Vehicle.VehicleStatus.MAINTENANCE);
            vehicleRepository.save(vehicle);
        }
        return maintenanceRepository.save(record);
    }

    public MaintenanceRecord updateRecord(Long id, MaintenanceRecord details) {
        MaintenanceRecord record = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));
        
        if (details.getType() != null) record.setType(details.getType());
        if (details.getDescription() != null) record.setDescription(details.getDescription());
        if (details.getServiceDate() != null) record.setServiceDate(details.getServiceDate());
        if (details.getNextServiceDate() != null) record.setNextServiceDate(details.getNextServiceDate());
        if (details.getMileageAtService() != null) record.setMileageAtService(details.getMileageAtService());
        if (details.getCost() != null) record.setCost(details.getCost());
        
        if (details.getStatus() != null) {
            record.setStatus(details.getStatus());
            
            // Special handling for vehicle status
            Vehicle vehicle = record.getVehicle();
            if (details.getStatus() == MaintenanceRecord.MaintenanceStatus.IN_PROGRESS) {
                vehicle.setStatus(Vehicle.VehicleStatus.MAINTENANCE);
            } else if (details.getStatus() == MaintenanceRecord.MaintenanceStatus.COMPLETED) {
                vehicle.setStatus(Vehicle.VehicleStatus.AVAILABLE);
                vehicle.setMileage(record.getMileageAtService());
            }
            vehicleRepository.save(vehicle);
        }
        
        return maintenanceRepository.save(record);
    }

    public List<MaintenanceRecord> getByVehicle(Long vehicleId) {
        return maintenanceRepository.findByVehicleId(vehicleId);
    }

    public List<MaintenanceRecord> getAll() {
        return maintenanceRepository.findAll();
    }
}
