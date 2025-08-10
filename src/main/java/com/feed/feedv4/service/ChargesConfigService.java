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

    // ===== CRUD used by your controller =====

    public List<ChargesConfig> getAll() {
        return repo.findAll();
    }

    public ChargesConfig getConfigById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Config not found"));
    }

    public ChargesConfig createOrUpdate(ChargesConfig config) {
        // Normalize serviceType
        if (config.getServiceType() != null) {
            config.setServiceType(config.getServiceType().trim().toUpperCase());
        }

        // Set default values for required numeric fields to avoid null constraint violations
        if (config.getFormulationFee() == null) config.setFormulationFee(0.0);
        if (config.getPelletingFee() == null) config.setPelletingFee(0.0);
        if (config.getRmMarkupPercent() == null) config.setRmMarkupPercent(0.0);
        if (config.getSystemFeePercent() == null) config.setSystemFeePercent(0.0);
        if (config.getRate() == null) config.setRate(0.0);
        if (config.getPercentage() == null) config.setPercentage(0.0);
        if (config.getActive() == null) config.setActive(true);

        // OPTIONAL: Upsert by (customerId, serviceType)
        if (config.getId() == null && config.getServiceType() != null) {
            Long customerId = config.getCustomerId();
            Optional<ChargesConfig> existing =
                    (customerId != null)
                            ? repo.findTopByCustomerIdAndServiceTypeOrderByLastUpdatedDesc(customerId, config.getServiceType())
                            : repo.findTopByServiceTypeOrderByLastUpdatedDesc(config.getServiceType());

            if (existing.isPresent()) {
                config.setId(existing.get().getId()); // update existing row
            }
        }

        return repo.save(config);
    }

    public void deleteConfig(Long id) {
        repo.deleteById(id);
    }

    // ===== Fee lookup used elsewhere =====

    public static class Fee {
        public final double rate;      // numeric value
        public final boolean percent;  // true = % of product value; false = per unit
        public Fee(double rate, boolean percent) {
            this.rate = rate;
            this.percent = percent;
        }
    }

    /** Try customer-specific first; fallback to global (no customer) latest */
    public Fee get(Long customerId, String serviceType) {
        String normalizedType = (serviceType == null ? "" : serviceType.trim().toUpperCase());

        Optional<ChargesConfig> opt =
                (customerId != null)
                        ? repo.findTopByCustomerIdAndServiceTypeOrderByLastUpdatedDesc(customerId, normalizedType)
                        : Optional.empty();

        ChargesConfig cfg = opt.orElseGet(() ->
                repo.findTopByServiceTypeOrderByLastUpdatedDesc(normalizedType).orElse(null)
        );

        if (cfg == null) return new Fee(0.0, false);

        return new Fee(cfg.getRate(), cfg.getPercentage() != null && cfg.getPercentage() > 0);
    }
}
