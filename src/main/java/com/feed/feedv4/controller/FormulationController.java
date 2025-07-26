package com.feed.feedv4.controller;

import com.feed.feedv4.dto.FormulationRequest;
import com.feed.feedv4.model.FeedProfile;
import com.feed.feedv4.model.Formulation;
import com.feed.feedv4.model.FormulationLog;
import com.feed.feedv4.repository.FeedProfileRepository;
import com.feed.feedv4.repository.FormulationLogRepository;
import com.feed.feedv4.repository.FormulationRepository;
import com.feed.feedv4.service.FormulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/formulations")
public class FormulationController {

    private final FormulationService service;
    @Autowired
    private FormulationLogRepository logRepository;
    @Autowired
    private FormulationRepository formulationRepository;

    @Autowired
    private FeedProfileRepository feedProfileRepository;

    public FormulationController(FormulationService service) {
        this.service = service;
    }

    @GetMapping
    public List<Formulation> getActiveFormulations() {
        return service.getAllActive();
    }
    
    @GetMapping("/all")
    public List<Formulation> getAllFormulations() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Formulation get(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public Formulation update(@PathVariable Long id, @RequestBody Formulation f) {
        return service.update(id, f);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<?> archive(@PathVariable Long id) {
        service.archive(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<?> lock(@PathVariable Long id) {
        service.lock(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/unlock")
    public ResponseEntity<?> unlock(@PathVariable Long id) {
        service.unlock(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<?> updateFormulation(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            service.updateFormulation(id, body);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Update failed: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/suggestions")
    public ResponseEntity<?> getSuggestions(@PathVariable Long id) {
        return ResponseEntity.ok(service.suggestAlternatives(id));
    }

    @GetMapping("/{id}/export/excel")
    public ResponseEntity<byte[]> exportExcel(@PathVariable Long id) {
        byte[] file = service.exportToExcel(id);
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=formulation.xlsx")
            .body(file);
    }

    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<byte[]> exportPDF(@PathVariable Long id) {
        byte[] file = service.exportToPDF(id);
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=formulation.pdf")
            .body(file);
    }

    @PutMapping("/{id}/unarchive")
    public ResponseEntity<?> unarchive(@PathVariable Long id) {
        service.unarchive(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/unfinalize")
    public ResponseEntity<?> unfinalize(@PathVariable Long id) {
        service.unfinalize(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/logs")
    public List<FormulationLog> getLogs(@PathVariable Long id) {
        return logRepository.findByFormulationIdOrderByTimestampDesc(id);
    }

    @PostMapping
    public ResponseEntity<Formulation> createFormulation(@RequestBody FormulationRequest request) {
        FeedProfile profile = feedProfileRepository.findById(request.getProfileId())
            .orElseThrow(() -> new RuntimeException("Feed Profile not found"));

        Formulation formulation = new Formulation();
        formulation.setFeedProfile(profile);
        formulation.setName(request.getName());
        formulation.setBatchSize(request.getBatchSize());
        formulation.setStrategy(String.join(", ", request.getStrategy()));  // join list into string
        formulation.setStatus("Draft");
        formulation.setVersion("v1.0");
        formulation.setCreatedAt(LocalDateTime.now());
        formulation.setUpdatedAt(LocalDateTime.now());
        formulation.setLocked(false);
        formulation.setFinalized(false);
        formulation.setTags(new ArrayList<>());
        formulation.setIngredients(new ArrayList<>());  // initially empty

        Formulation saved = formulationRepository.save(formulation);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/toggle-archive")
    public ResponseEntity<?> toggleArchive(@PathVariable Long id) {
        Formulation f = formulationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Not found"));
        if ("Archived".equals(f.getStatus())) {
            f.setStatus("Draft");
        } else {
            f.setStatus("Archived");
        }
        formulationRepository.save(f);
        return ResponseEntity.ok().build();
    }

}
