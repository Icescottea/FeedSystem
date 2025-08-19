package com.feed.feedv4.service;

import com.feed.feedv4.dto.FactoryDTO;
import com.feed.feedv4.model.Factory;
import com.feed.feedv4.repository.FactoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FactoryService {

    private final FactoryRepository repo;

    public FactoryService(FactoryRepository repo) {
        this.repo = repo;
    }

    /* -------------------- CRUD -------------------- */

    @Transactional(readOnly = true)
    public List<FactoryDTO> list(String q) {
        List<Factory> src = (q == null || q.isBlank())
                ? repo.findAll()
                : repo.findByNameContainingIgnoreCase(q.trim());
        return src.stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public FactoryDTO getById(Long id) {
        Factory f = repo.findById(id).orElseThrow(() -> notFound(id));
        return toDTO(f);
    }

    public FactoryDTO create(FactoryDTO in) {
        validateRegNoUniqueForCreate(in.getRegistrationNumber());
        Factory f = new Factory();
        apply(in, f);
        Factory saved = repo.save(f);
        return toDTO(saved);
    }

    public FactoryDTO update(Long id, FactoryDTO in) {
        Factory f = repo.findById(id).orElseThrow(() -> notFound(id));
        validateRegNoUniqueForUpdate(id, in.getRegistrationNumber());
        apply(in, f);
        Factory saved = repo.save(f);
        return toDTO(saved);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw notFound(id);
        repo.deleteById(id);
    }

    /* -------------------- Helpers -------------------- */

    private void validateRegNoUniqueForCreate(String regNo) {
        if (regNo == null || regNo.isBlank()) return;
        if (repo.existsByRegistrationNumberIgnoreCase(regNo.trim())) {
            throw new IllegalArgumentException("Registration number already exists");
        }
    }

    private void validateRegNoUniqueForUpdate(Long id, String regNo) {
        if (regNo == null || regNo.isBlank()) return;
        repo.findByRegistrationNumberIgnoreCase(regNo.trim())
            .filter(existing -> !existing.getId().equals(id))
            .ifPresent(x -> { throw new IllegalArgumentException("Registration number already exists"); });
    }

    private void apply(FactoryDTO in, Factory f) {
        f.setName(nullSafe(in.getName()));
        f.setRegistrationNumber(nullSafe(in.getRegistrationNumber()));
        f.setAddress(nullSafe(in.getAddress()));
        f.setContactNumber(nullSafe(in.getContactNumber()));
        f.setEmail(nullSafe(in.getEmail()));
        f.setLogoUrl(nullSafe(in.getLogoUrl()));
        // createdAt/updatedAt handled by @PrePersist/@PreUpdate
    }

    private FactoryDTO toDTO(Factory f) {
        FactoryDTO dto = new FactoryDTO();
        dto.setId(f.getId());
        dto.setName(f.getName());
        dto.setRegistrationNumber(f.getRegistrationNumber());
        dto.setAddress(f.getAddress());
        dto.setContactNumber(f.getContactNumber());
        dto.setEmail(f.getEmail());
        dto.setLogoUrl(f.getLogoUrl());
        return dto;
    }

    private RuntimeException notFound(Long id) {
        return new IllegalArgumentException("Factory not found: " + id);
    }

    private String nullSafe(String s) {
        return (s == null) ? null : s.trim();
    }
}
