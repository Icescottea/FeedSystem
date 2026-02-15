package com.feed.feedv4.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.feed.feedv4.dto.VendorDTO;
import com.feed.feedv4.service.VendorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vendors")

public class VendorController {
    
    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }
    
    @GetMapping
    public ResponseEntity<List<VendorDTO>> getAllVendors() {
        List<VendorDTO> vendors = vendorService.getAllVendors();
        return ResponseEntity.ok(vendors);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<VendorDTO>> getAllActiveVendors() {
        List<VendorDTO> vendors = vendorService.getAllActiveVendors();
        return ResponseEntity.ok(vendors);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<VendorDTO> getVendorById(@PathVariable Long id) {
        VendorDTO vendor = vendorService.getVendorById(id);
        return ResponseEntity.ok(vendor);
    }
    
    @GetMapping("/{id}/with-financials")
    public ResponseEntity<VendorDTO> getVendorWithFinancials(@PathVariable Long id) {
        VendorDTO vendor = vendorService.getVendorWithFinancials(id);
        return ResponseEntity.ok(vendor);
    }
    
    @PostMapping
    public ResponseEntity<VendorDTO> createVendor(@Valid @RequestBody VendorDTO vendorDTO) {
        VendorDTO createdVendor = vendorService.createVendor(vendorDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdVendor);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<VendorDTO> updateVendor(
            @PathVariable Long id,
            @Valid @RequestBody VendorDTO vendorDTO) {
        VendorDTO updatedVendor = vendorService.updateVendor(id, vendorDTO);
        return ResponseEntity.ok(updatedVendor);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{id}/mark-inactive")
    public ResponseEntity<VendorDTO> markVendorInactive(@PathVariable Long id) {
        VendorDTO vendor = vendorService.markVendorInactive(id);
        return ResponseEntity.ok(vendor);
    }
    
    @PutMapping("/{id}/mark-active")
    public ResponseEntity<VendorDTO> markVendorActive(@PathVariable Long id) {
        VendorDTO vendor = vendorService.markVendorActive(id);
        return ResponseEntity.ok(vendor);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<VendorDTO>> searchVendors(@RequestParam String query) {
        List<VendorDTO> vendors = vendorService.searchVendors(query);
        return ResponseEntity.ok(vendors);
    }
}