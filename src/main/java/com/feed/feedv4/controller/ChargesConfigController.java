package com.feed.feedv4.controller;

import com.feed.feedv4.model.ChargesConfig;
import com.feed.feedv4.service.ChargesConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Multi-record fee configuration:
 * - List with filters
 * - Create / Update
 * - Activate / Archive / Delete
 * - Duplicate
 * - Lightweight "options" for dropdowns
 */
@RestController
@RequestMapping("/api/charges-config")
public class ChargesConfigController {

    private final ChargesConfigService service;

    // Canonical DTO the frontend expects
    public record FeeConfigDTO(
        Long id,
        String name,
        double pelletingPerKg,
        double systemPercent,
        double formulationPerKg
    ) {}

    private static Double firstNonNull(Double... vals) {
        for (Double v : vals) {
            if (v != null) return v;
        }
        return null;
    }

    private FeeConfigDTO toDto(ChargesConfig c) {
        // 🔧 Map ALL plausible names you might have used in the entity
        // Pelleting (₹/kg)
        Double pelleting = firstNonNull(
            // common variants
            getSafe(() -> c.getPelletingFee())
        );

        // System (%)
        Double systemPct = firstNonNull(
            getSafe(() -> c.getSystemFeePercent())
        );

        // Formulation (₹/kg)
        Double formulation = firstNonNull(
            getSafe(() -> c.getFormulationFee())
        );

        return new FeeConfigDTO(
            c.getId(),
            c.getName(),
            pelleting != null ? pelleting : 0.0,
            systemPct != null ? systemPct : 0.0,
            formulation != null ? formulation : 0.0
        );
    }

    /** small helper to avoid NoSuchMethodError/NPE if getters are missing */
    private static <T> T getSafe(java.util.concurrent.Callable<T> call) {
        try { return call.call(); } catch (Throwable t) { return null; }
    }

    @GetMapping("/{id}/normalized")
    public ResponseEntity<FeeConfigDTO> getNormalized(@PathVariable Long id) {
        ChargesConfig cfg = service.getById(id);
        return ResponseEntity.ok(toDto(cfg));
    }

    public ChargesConfigController(ChargesConfigService service) {
        this.service = service;
    }

    // ----- List / Read -----

    /**
     * List configs with optional filters.
     * @param q optional search text (name/description)
     * @param active optional filter by active (true/false)
     * @param archived optional filter by archived (true/false)
     */
    @GetMapping("/list")
    public List<ChargesConfig> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean archived
    ) {
        return service.list(q, active, archived);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChargesConfig> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Optional: latest active non-archived (if you still want a default). */
    @GetMapping("/effective")
    public ResponseEntity<ChargesConfig> effective() {
        return service.getEffective()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lightweight options for dropdowns (id + name).
     * Supports filters similar to list.
     */
    @GetMapping("/options")
    public List<Option> options(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean archived
    ) {
        return service.list(q, active, archived).stream()
                .map(c -> new Option(c.getId(), c.getName()))
                .toList();
    }

    // ----- Create / Update -----

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ChargesConfig in) {
        try {
            return ResponseEntity.ok(service.create(in));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Create failed");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ChargesConfig in) {
        try {
            return ResponseEntity.ok(service.update(id, in));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Update failed");
        }
    }

    // ----- Status toggles -----

    @PatchMapping("/{id}/active")
    public ResponseEntity<?> setActive(@PathVariable Long id, @RequestParam boolean active) {
        try {
            return ResponseEntity.ok(service.toggleActive(id, active));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Toggle active failed");
        }
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<?> setArchived(@PathVariable Long id, @RequestParam boolean archived) {
        try {
            return ResponseEntity.ok(service.setArchived(id, archived));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Archive toggle failed");
        }
    }

    // ----- Duplicate / Delete -----

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<?> duplicate(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.duplicate(id));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Duplicate failed");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Delete failed");
        }
    }

    // ----- DTO -----
    public record Option(Long id, String name) {}
}
