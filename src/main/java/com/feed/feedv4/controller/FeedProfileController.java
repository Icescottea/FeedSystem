package com.feed.feedv4.controller;

import com.feed.feedv4.model.FeedProfile;
import com.feed.feedv4.service.FeedProfileService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feed-profiles")
public class FeedProfileController {

    private final FeedProfileService service;

    public FeedProfileController(FeedProfileService service) {
        this.service = service;
    }

    @GetMapping
    public List<FeedProfile> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedProfile> getById(@PathVariable Long id) {
        return service.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public FeedProfile create(@RequestBody FeedProfile profile) {
        return service.save(profile);
    }

    @PutMapping("/{id}")
    public FeedProfile update(@PathVariable Long id, @RequestBody FeedProfile profile) {
        return service.update(id, profile);
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<?> archive(@PathVariable Long id) {
        service.archive(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/toggle-lock")
    public ResponseEntity<?> toggleLock(@PathVariable Long id) {
        service.toggleLock(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
