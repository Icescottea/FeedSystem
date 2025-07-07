package com.feed.feedv4.controller;

import com.feed.feedv4.model.ChargesConfig;
import com.feed.feedv4.service.ChargesConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
public class ChargesConfigController {

    @Autowired
    private ChargesConfigService feeConfigService;

    @GetMapping
    public List<ChargesConfig> getAll() {
        return feeConfigService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChargesConfig> getConfig(@PathVariable Long id) {
        ChargesConfig config = feeConfigService.getConfigById(id);
        return ResponseEntity.ok(config);
    }

    @PostMapping
    public ResponseEntity<ChargesConfig> create(@RequestBody ChargesConfig config) {
        ChargesConfig saved = feeConfigService.createOrUpdate(config);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChargesConfig> update(@PathVariable Long id, @RequestBody ChargesConfig config) {
        config.setId(id);
        ChargesConfig updated = feeConfigService.createOrUpdate(config);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        feeConfigService.deleteConfig(id);
        return ResponseEntity.ok().build();
    }
}
