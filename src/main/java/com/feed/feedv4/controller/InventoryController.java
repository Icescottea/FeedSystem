package com.feed.feedv4.controller;

import com.feed.feedv4.model.RawMaterial;
import com.feed.feedv4.repository.RawMaterialRepository;
import com.feed.feedv4.service.InventoryService;
import com.feed.feedv4.util.ExcelHelper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService service;
    private final RawMaterialRepository rawMaterialRepository;
    private final ExcelHelper excelHelper;

    public InventoryController(
        InventoryService service,
        RawMaterialRepository rawMaterialRepository,
        ExcelHelper excelHelper
    ) {
        this.service = service;
        this.rawMaterialRepository = rawMaterialRepository;
        this.excelHelper = excelHelper;
    }

    @GetMapping
    public List<RawMaterial> getAll() {
        return service.getAllActive();
    }

    @GetMapping("/all")
    public List<RawMaterial> getAllMaterials() {
        return service.getAll(); // Includes archived
    }

    @PostMapping
    public RawMaterial add(@RequestBody RawMaterial material) {
        return service.save(material);
    }

    @PutMapping("/{id}")
    public RawMaterial update(@PathVariable Long id, @RequestBody RawMaterial material) {
        return service.update(id, material);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRawMaterial(@PathVariable Long id) {
        if (!rawMaterialRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        rawMaterialRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/toggle-archive")
    public ResponseEntity<?> toggleArchive(@PathVariable Long id) {
        RawMaterial material = rawMaterialRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Raw material not found"));

        material.setArchived(!material.isArchived());
        rawMaterialRepository.save(material);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<?> uploadInventoryExcel(
        @RequestParam("file") MultipartFile file,
        @RequestParam(name = "overwrite", defaultValue = "false") boolean overwrite
    ) {
        try {
            List<RawMaterial> rawMaterials = excelHelper.parseExcel(file.getInputStream());

            for (RawMaterial incoming : rawMaterials) {
                Optional<RawMaterial> existing = rawMaterialRepository
                    .findByNameAndBatchId(incoming.getName(), incoming.getBatchId());

                if (existing.isPresent()) {
                    if (overwrite) {
                        incoming.setId(existing.get().getId());
                        rawMaterialRepository.save(incoming);
                    }
                    // Else skip duplicate
                } else {
                    rawMaterialRepository.save(incoming);
                }
            }

            return ResponseEntity.ok("✅ Bulk upload successful.");
        } catch (Exception e) {
            e.printStackTrace(); // full error in logs
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("❌ Error during Excel upload: " + e.getMessage());
        }
    }

    @GetMapping("/low-stock")
    public List<RawMaterial> getLowStockMaterials() {
        return service.getLowStockMaterials();
    }

    @PutMapping("/{id}/toggle-lock")
    public ResponseEntity<?> toggleLock(@PathVariable Long id) {
        service.toggleLock(id);
        return ResponseEntity.ok().build();
    }

}
