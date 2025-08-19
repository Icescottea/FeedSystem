package com.feed.feedv4.controller;

import com.feed.feedv4.dto.FactoryDTO;
import com.feed.feedv4.service.FactoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/factories")
public class FactoryController {

    private final FactoryService service;

    public FactoryController(FactoryService service) {
        this.service = service;
    }

    /* -------------------- LIST + SEARCH -------------------- */
    @GetMapping
    public ResponseEntity<List<FactoryDTO>> list(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(service.list(q));
    }

    /* -------------------- GET -------------------- */
    @GetMapping("/{id}")
    public ResponseEntity<FactoryDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /* -------------------- CREATE -------------------- */
    @PostMapping
    public ResponseEntity<FactoryDTO> create(@RequestBody FactoryDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    /* -------------------- UPDATE -------------------- */
    @PutMapping("/{id}")
    public ResponseEntity<FactoryDTO> update(@PathVariable Long id, @RequestBody FactoryDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    /* -------------------- DELETE -------------------- */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
