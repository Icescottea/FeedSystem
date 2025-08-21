package com.feed.feedv4.controller;

import com.feed.feedv4.dto.FormulationGenerationRequest;
import com.feed.feedv4.dto.FormulationResponse;
import com.feed.feedv4.dto.FormulationSaveRequest;
import com.feed.feedv4.model.Formulation;
import com.feed.feedv4.model.FormulationLog;
import com.feed.feedv4.repository.FormulationLogRepository;
import com.feed.feedv4.repository.FormulationRepository;
import com.feed.feedv4.service.FormulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/formulations")
public class FormulationController {

    private final FormulationService service;

    @Autowired
    private FormulationLogRepository logRepository;

    @Autowired
    private FormulationRepository formulationRepository;

    public FormulationController(FormulationService service) {
        this.service = service;
    }

    // -------- List / Read --------

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

    // -------- Update / Delete --------

    @PutMapping("/{id}")
    public Formulation update(@PathVariable Long id, @RequestBody Formulation f) {
        return service.update(id, f);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(409).body(ex.getMessage()); // 409 Conflict
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Delete failed");
        }
    }

    // -------- Status / Flags --------

    @PutMapping("/{id}/archive")
    public ResponseEntity<?> archive(@PathVariable Long id) {
        service.archive(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/unarchive")
    public ResponseEntity<?> unarchive(@PathVariable Long id) {
        service.unarchive(id);
        return ResponseEntity.ok().build();
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

    @PutMapping("/{id}/unfinalize")
    public ResponseEntity<?> unfinalize(@PathVariable Long id) {
        service.unfinalize(id);
        return ResponseEntity.ok().build();
    }

    // -------- Rich update helpers --------

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

    // -------- Export --------

    @GetMapping("/{id}/export/excel")
    public ResponseEntity<byte[]> exportExcel(@PathVariable Long id) {
        byte[] file = service.exportToExcel(id);
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=formulation.xlsx")
            .body(file);
    }

    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<byte[]> exportPDF(@PathVariable Long id) {
        byte[] bytes = service.exportToPDF(id); // throws if it fails

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
            ContentDisposition.attachment()
                .filename("formulation-" + id + ".pdf")
                .build()
        );
        headers.setContentLength(bytes.length);

        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

    // -------- Engine: generate + save + finalize --------

    @PostMapping("/generate")
    public ResponseEntity<FormulationResponse> generateFormulation(
            @RequestBody FormulationGenerationRequest request) {
        FormulationResponse response = service.generateFormulation(
                request.getProfileId(),
                request.getBatchSize()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Formulation> create(@RequestBody FormulationSaveRequest req) {
        return ResponseEntity.ok(service.createFromEngine(req));
    }

    @PutMapping("/{id}/finalize")
    public ResponseEntity<String> finalize(@PathVariable Long id) {
        service.finalize(id);
        return ResponseEntity.ok("Formulation finalized and sent to pelleting");
    }

    // -------- Logs --------

    @GetMapping("/{id}/logs")
    public List<FormulationLog> getLogs(@PathVariable Long id) {
        return logRepository.findByFormulationIdOrderByTimestampDesc(id);
    }
}
