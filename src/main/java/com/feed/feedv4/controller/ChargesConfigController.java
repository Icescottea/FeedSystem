package com.feed.feedv4.controller;

import com.feed.feedv4.model.ChargesConfig;
import com.feed.feedv4.repository.ChargesConfigRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/charges-config")
public class ChargesConfigController {

    private final ChargesConfigRepository repo;

    public ChargesConfigController(ChargesConfigRepository repo) {
        this.repo = repo;
    }

    // ---- Read ----

    // List all (admin)
    @GetMapping
    public List<ChargesConfig> listAll() {
        return repo.findAll();
    }

    // Get by id
    @GetMapping("/{id}")
    public ResponseEntity<ChargesConfig> getById(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get effective config (latest active) – used by invoicing
    @GetMapping("/effective")
    public ResponseEntity<ChargesConfig> getEffective() {
        return repo.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getActive()))
                .max(Comparator.comparing(ChargesConfig::getLastUpdated, Comparator.nullsFirst(Comparator.naturalOrder())))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build()); // no active config
    }

    // ---- Write ----

    // Create new config (global)
    @PostMapping
    public ResponseEntity<ChargesConfig> create(@RequestBody ChargesConfig in) {
        sanitize(in);
        ChargesConfig saved = repo.save(in);
        return ResponseEntity.ok(saved);
    }

    // Update existing config
    @PutMapping("/{id}")
    public ResponseEntity<ChargesConfig> update(@PathVariable Long id, @RequestBody ChargesConfig in) {
        return repo.findById(id)
                .map(ex -> {
                    // full replace of fee fields + active
                    ex.setPelletingFeeType(in.getPelletingFeeType());
                    ex.setPelletingFee(in.getPelletingFee());
                    ex.setFormulationFeeType(in.getFormulationFeeType());
                    ex.setFormulationFee(in.getFormulationFee());
                    ex.setSystemFeePercent(in.getSystemFeePercent());
                    ex.setActive(in.getActive());
                    sanitize(ex);
                    return ResponseEntity.ok(repo.save(ex));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Toggle active (enable/disable)
    @PatchMapping("/{id}/active")
    public ResponseEntity<ChargesConfig> toggleActive(@PathVariable Long id, @RequestParam boolean active) {
        return repo.findById(id)
                .map(cfg -> {
                    cfg.setActive(active);
                    return ResponseEntity.ok(repo.save(cfg));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete (use sparingly; usually prefer toggling active)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---- helpers ----
    private void sanitize(ChargesConfig c) {
        if (c.getPelletingFee() == null) c.setPelletingFee(0.0);
        if (c.getFormulationFee() == null) c.setFormulationFee(0.0);
        if (c.getSystemFeePercent() == null) c.setSystemFeePercent(0.0);
        if (c.getPelletingFeeType() == null) c.setPelletingFeeType(ChargesConfig.FeeBasis.PER_KG);
        if (c.getFormulationFeeType() == null) c.setFormulationFeeType(ChargesConfig.FeeBasis.PER_KG);
        if (c.getActive() == null) c.setActive(true);
    }
}
