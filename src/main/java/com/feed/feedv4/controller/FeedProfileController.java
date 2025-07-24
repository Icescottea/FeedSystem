package com.feed.feedv4.controller;

import com.feed.feedv4.model.FeedProfile;
import com.feed.feedv4.service.FeedProfileService;
import com.feed.feedv4.repository.FeedProfileRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/feed-profiles")
public class FeedProfileController {

    private final FeedProfileService service;
    private final FeedProfileRepository feedProfileRepository;

    public FeedProfileController(FeedProfileService service, FeedProfileRepository feedProfileRepository) {
        this.service = service;
        this.feedProfileRepository = feedProfileRepository;
    }

    @GetMapping
    public List<FeedProfile> getAll() {
        return feedProfileRepository.findByArchivedFalse();
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

    @PutMapping("/{id}/toggle-archive")
    public ResponseEntity<?> toggleArchive(@PathVariable Long id) {
        FeedProfile profile = feedProfileRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Raw material not found"));

        profile.setArchived(!profile.isArchived());
        feedProfileRepository.save(profile);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/all")
    public List<FeedProfile> getAllIncludingArchived() {
        return feedProfileRepository.findAll();
    }

}
