package com.carrental.controller;

import com.carrental.entity.VehicleCategory;
import com.carrental.repository.VehicleCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategoryController {
    private final VehicleCategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<VehicleCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleCategory> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<VehicleCategory> createCategory(@RequestBody VehicleCategory category) {
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleCategory> updateCategory(@PathVariable Long id, @RequestBody VehicleCategory categoryDetails) {
        return categoryRepository.findById(id)
                .map(category -> {
                    category.setName(categoryDetails.getName());
                    if (categoryDetails.getDescription() != null) category.setDescription(categoryDetails.getDescription());
                    if (categoryDetails.getBaseRate() != null) category.setBaseRate(categoryDetails.getBaseRate());
                    if (categoryDetails.getIconUrl() != null) category.setIconUrl(categoryDetails.getIconUrl());
                    return ResponseEntity.ok(categoryRepository.save(category));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
