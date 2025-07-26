package com.feed.feedv4.service;

import com.feed.feedv4.model.RawMaterial;
import com.feed.feedv4.repository.RawMaterialRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    private final RawMaterialRepository repository;

    public InventoryService(RawMaterialRepository repository) {
        this.repository = repository;
    }

    public List<RawMaterial> getAllActive() {
        return repository.findByArchivedFalse();
    }

    public Optional<RawMaterial> getById(Long id) {
        return repository.findById(id);
    }

    public RawMaterial save(RawMaterial rawMaterial) {
        return repository.save(rawMaterial);
    }

    public RawMaterial update(Long id, RawMaterial updated) {
        return repository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setType(updated.getType());
            existing.setCostPerKg(updated.getCostPerKg());
            existing.setInStockKg(updated.getInStockKg());
            existing.setExpiryDate(updated.getExpiryDate());
            existing.setSupplier(updated.getSupplier());
            existing.setBatchId(updated.getBatchId());
            existing.setQualityGrade(updated.getQualityGrade());
            existing.setLocked(updated.isLocked());
            existing.setCp(updated.getCp());
            existing.setMe(updated.getMe());
            existing.setCalcium(updated.getCalcium());
            existing.setFat(updated.getFat());
            existing.setFiber(updated.getFiber());
            existing.setAsh(updated.getAsh());
            return repository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Material not found"));
    }

    public List<RawMaterial> getAll() {
        return repository.findAll(); // No filter
    }

    public List<RawMaterial> getLowStockMaterials() {
        return repository.findByInStockKgLessThanEqual(50.0);
    }

    public void toggleLock(Long id) {
        RawMaterial rm = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Raw material not found"));
        
        rm.setLocked(!rm.isLocked());
        repository.save(rm);
    }

}
