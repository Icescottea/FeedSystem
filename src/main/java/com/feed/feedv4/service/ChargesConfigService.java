package com.feed.feedv4.service;

import com.feed.feedv4.model.ChargesConfig;
import com.feed.feedv4.model.ChargesConfig.FeeBasis;
import com.feed.feedv4.repository.ChargesConfigRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChargesConfigService {

    private final ChargesConfigRepository repo;

    public ChargesConfigService(ChargesConfigRepository repo) {
        this.repo = repo;
    }

    // ---------- Queries ----------

    public List<ChargesConfig> list(String q, Boolean active, Boolean archived) {
        List<ChargesConfig> all = repo.findAll();

        return all.stream()
                .filter(c -> q == null || q.isBlank()
                        || (c.getName() != null && c.getName().toLowerCase().contains(q.toLowerCase()))
                        || (c.getDescription() != null && c.getDescription().toLowerCase().contains(q.toLowerCase())))
                .filter(c -> active == null || Objects.equals(c.getActive(), active))
                .filter(c -> archived == null || Objects.equals(c.getArchived(), archived))
                .sorted(Comparator
                        .comparing(ChargesConfig::getArchived) // non-archived first
                        .thenComparing(ChargesConfig::getActive, Comparator.reverseOrder()) // active before inactive
                        .thenComparing((ChargesConfig c) -> Optional.ofNullable(c.getUpdatedAt()).orElse(c.getCreatedAt()),
                                Comparator.nullsFirst(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public ChargesConfig getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new NoSuchElementException("ChargesConfig not found: " + id));
    }

    /** Latest active, non-archived config (useful if you still want an 'effective' default). */
    public Optional<ChargesConfig> getEffective() {
        // If you added repo.findTopByActiveTrueOrderByLastUpdatedDesc() you can call it here.
        return repo.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getActive()) && Boolean.FALSE.equals(c.getArchived()))
                .max(Comparator.comparing(ChargesConfig::getUpdatedAt, Comparator.nullsFirst(Comparator.naturalOrder())));
    }

    // ---------- Mutations ----------

    public ChargesConfig create(ChargesConfig in) {
        sanitize(in);
        validate(in, false);
        in.setId(null);
        return repo.save(in);
    }

    public ChargesConfig update(Long id, ChargesConfig in) {
        ChargesConfig ex = getById(id);
        ex.setName(trim(in.getName()));
        ex.setDescription(in.getDescription());
        ex.setActive(in.getActive());
        ex.setArchived(in.getArchived());

        ex.setPelletingFeeType(in.getPelletingFeeType());
        ex.setPelletingFee(in.getPelletingFee());
        ex.setFormulationFeeType(in.getFormulationFeeType());
        ex.setFormulationFee(in.getFormulationFee());
        ex.setSystemFeePercent(in.getSystemFeePercent());

        sanitize(ex);
        validate(ex, true);
        return repo.save(ex);
    }

    public ChargesConfig toggleActive(Long id, boolean active) {
        ChargesConfig cfg = getById(id);
        cfg.setActive(active);
        return repo.save(cfg);
    }

    public ChargesConfig setArchived(Long id, boolean archived) {
        ChargesConfig cfg = getById(id);
        cfg.setArchived(archived);
        if (archived) cfg.setActive(false); // archived implies inactive
        return repo.save(cfg);
    }

    public void delete(Long id) {
        if (repo.existsById(id)) repo.deleteById(id);
    }

    public ChargesConfig duplicate(Long id) {
        ChargesConfig src = getById(id);
        ChargesConfig copy = new ChargesConfig();

        copy.setName(uniqueCopyName(src.getName()));
        copy.setDescription(src.getDescription());
        copy.setActive(src.getActive());
        copy.setArchived(false);

        copy.setPelletingFeeType(src.getPelletingFeeType());
        copy.setPelletingFee(src.getPelletingFee());
        copy.setFormulationFeeType(src.getFormulationFeeType());
        copy.setFormulationFee(src.getFormulationFee());
        copy.setSystemFeePercent(src.getSystemFeePercent());

        sanitize(copy);
        validate(copy, false);
        return repo.save(copy);
    }

    // ---------- Helpers ----------

    private void sanitize(ChargesConfig c) {
        c.setName(trim(c.getName()));
        if (c.getName() == null || c.getName().isBlank()) c.setName("Config");

        if (c.getPelletingFeeType() == null) c.setPelletingFeeType(FeeBasis.PER_KG);
        if (c.getFormulationFeeType() == null) c.setFormulationFeeType(FeeBasis.PER_KG);

        if (c.getPelletingFee() == null) c.setPelletingFee(0.0);
        if (c.getFormulationFee() == null) c.setFormulationFee(0.0);
        if (c.getSystemFeePercent() == null) c.setSystemFeePercent(0.0);

        if (c.getActive() == null) c.setActive(true);
        if (c.getArchived() == null) c.setArchived(false);
    }

    private void validate(ChargesConfig c, boolean isUpdate) {
        if (c.getName() == null || c.getName().isBlank())
            throw new IllegalArgumentException("Name is required");

        if (c.getName().length() > 100)
            throw new IllegalArgumentException("Name too long (max 100 chars)");

        if (c.getPelletingFee() < 0) throw new IllegalArgumentException("Pelleting fee cannot be negative");
        if (c.getFormulationFee() < 0) throw new IllegalArgumentException("Formulation fee cannot be negative");
        if (c.getSystemFeePercent() < 0 || c.getSystemFeePercent() > 100)
            throw new IllegalArgumentException("System fee percent must be between 0 and 100");

        if (c.getPelletingFeeType() == null) throw new IllegalArgumentException("Pelleting fee basis is required");
        if (c.getFormulationFeeType() == null) throw new IllegalArgumentException("Formulation fee basis is required");
    }

    private String trim(String s) {
        return (s == null) ? null : s.trim();
    }

    private String uniqueCopyName(String base) {
        String b = (base == null || base.isBlank()) ? "Config" : base.trim();
        String candidate = b + " (Copy)";
        Set<String> existing = repo.findAll().stream()
                .map(ChargesConfig::getName)
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        if (!existing.contains(candidate.toLowerCase())) return candidate;

        for (int i = 2; i <= 99; i++) {
            String c = b + " (Copy " + i + ")";
            if (!existing.contains(c.toLowerCase())) return c;
        }
        return UUID.randomUUID().toString();
    }
}
