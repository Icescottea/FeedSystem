package com.feed.feedv4.service;

import com.feed.feedv4.model.ChargesConfig;
import com.feed.feedv4.repository.ChargesConfigRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChargesConfigService {

    private final ChargesConfigRepository repo;

    public ChargesConfigService(ChargesConfigRepository repo) {
        this.repo = repo;
    }

    // -------- Read --------

    public List<ChargesConfig> listAll() {
        return repo.findAll();
    }

    public ChargesConfig getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("ChargesConfig not found: " + id));
    }

    /** Latest active configuration used for invoicing. */
    public Optional<ChargesConfig> getEffective() {
        return repo.findTopByActiveTrueOrderByLastUpdatedDesc();
    }

    // -------- Write --------

    public ChargesConfig create(ChargesConfig in) {
        sanitize(in);
        validate(in);
        return repo.save(in);
    }

    public ChargesConfig update(Long id, ChargesConfig in) {
        ChargesConfig ex = getById(id);
        ex.setPelletingFeeType(in.getPelletingFeeType());
        ex.setPelletingFee(in.getPelletingFee());
        ex.setFormulationFeeType(in.getFormulationFeeType());
        ex.setFormulationFee(in.getFormulationFee());
        ex.setSystemFeePercent(in.getSystemFeePercent());
        ex.setActive(in.getActive());
        sanitize(ex);
        validate(ex);
        return repo.save(ex);
    }

    public ChargesConfig toggleActive(Long id, boolean active) {
        ChargesConfig cfg = getById(id);
        cfg.setActive(active);
        return repo.save(cfg);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) return;
        repo.deleteById(id);
    }

    // -------- Helpers --------

    private void sanitize(ChargesConfig c) {
        if (c.getPelletingFee() == null) c.setPelletingFee(0.0);
        if (c.getFormulationFee() == null) c.setFormulationFee(0.0);
        if (c.getSystemFeePercent() == null) c.setSystemFeePercent(0.0);
        if (c.getPelletingFeeType() == null) c.setPelletingFeeType(ChargesConfig.FeeBasis.PER_KG);
        if (c.getFormulationFeeType() == null) c.setFormulationFeeType(ChargesConfig.FeeBasis.PER_KG);
        if (c.getActive() == null) c.setActive(true);
    }

    private void validate(ChargesConfig c) {
        if (c.getPelletingFee() < 0) throw new IllegalArgumentException("Pelleting fee cannot be negative");
        if (c.getFormulationFee() < 0) throw new IllegalArgumentException("Formulation fee cannot be negative");
        if (c.getSystemFeePercent() < 0 || c.getSystemFeePercent() > 100)
            throw new IllegalArgumentException("System fee percent must be between 0 and 100");
    }
}
