package com.feed.feedv4.service;

import com.feed.feedv4.dto.CreateInvoiceDTO;
import com.feed.feedv4.model.ChargesConfig;
import com.feed.feedv4.model.Formulation;
import com.feed.feedv4.model.FormulationIngredient;
import com.feed.feedv4.model.Invoice;
import com.feed.feedv4.model.Payment;
import com.feed.feedv4.model.PelletingBatch;
import com.feed.feedv4.repository.ChargesConfigRepository;
import com.feed.feedv4.repository.InvoiceRepository;
import com.feed.feedv4.repository.PaymentRepository;
import com.feed.feedv4.repository.PelletingBatchRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepo;
    private final PelletingBatchRepository batchRepo;
    private final ChargesConfigRepository chargesRepo;
    private final PaymentRepository paymentRepository;

    public InvoiceService(
            InvoiceRepository invoiceRepo,
            PelletingBatchRepository batchRepo,
            ChargesConfigRepository chargesRepo,
            PaymentRepository paymentRepository
    ) {
        this.invoiceRepo = invoiceRepo;
        this.batchRepo = batchRepo;
        this.chargesRepo = chargesRepo;
        this.paymentRepository = paymentRepository;
    }

    /* -------------------- CREATE -------------------- */
    @Transactional
    public Invoice createInvoice(CreateInvoiceDTO dto) {
        // --- 1) Resolve batch & base cost (manufacturing cost) ---
        PelletingBatch batch = null;
        double qtyKg = 0.0;
        double costPerKg = 0.0;

        if (dto.getBatchId() != null) {
            batch = batchRepo.findWithFormulationById(dto.getBatchId())
                    .orElseThrow(() -> new RuntimeException("Batch not found: " + dto.getBatchId()));

            qtyKg = (batch.getActualYieldKg() > 0 ? batch.getActualYieldKg()
                    : (batch.getTargetQuantityKg() > 0 ? batch.getTargetQuantityKg() : 0));

            if (batch.getFormulation() != null) {
                costPerKg = safe(batch.getFormulation().getCostPerKg());
                if (costPerKg <= 0) {
                    // fallback: compute from ingredients we just join-fetched
                    costPerKg = computeCostPerKgFromIngredients(batch.getFormulation());
                }
            }
        }

        final double baseCost = round2(qtyKg * costPerKg); // manufacturing cost

        ChargesConfig cfg = null;
        String feeTypeDisplayName = dto.getServiceType();
        if (feeTypeDisplayName != null) feeTypeDisplayName = feeTypeDisplayName.trim();

        if (feeTypeDisplayName != null && !feeTypeDisplayName.isEmpty()) {
            // 1) try by name (your UI sends names like "standard")
            cfg = chargesRepo.findByNameIgnoreCase(feeTypeDisplayName).orElse(null);
        
            // 2) if not found, and looks numeric, try by id
            if (cfg == null) {
                try {
                    Long cfgId = Long.valueOf(feeTypeDisplayName);
                    cfg = chargesRepo.findById(cfgId).orElse(null);
                } catch (NumberFormatException ignore) { /* not an ID */ }
            }
        }

        // 3) final fallback to latest active config (so fees won’t be zero silently)
        if (cfg == null) {
            cfg = chargesRepo.findTopByActiveTrueAndArchivedFalseOrderByUpdatedAtDesc()
                    .orElseGet(() -> chargesRepo.findTopByActiveTrueAndArchivedFalseOrderByCreatedAtDesc()
                            .orElse(null));
        }

        // compute fees only if we resolved a config
        double pelletingFeeTotal = 0, formulationFeeTotal = 0, systemFeeTotal = 0;
        if (cfg != null) {
            if (feeTypeDisplayName == null || feeTypeDisplayName.isBlank()) {
                feeTypeDisplayName = cfg.getName();
            }
        
            double pelletingPerKg   = (cfg.getPelletingFeeType()   == ChargesConfig.FeeBasis.PER_KG)   ? safe(cfg.getPelletingFee())   : 0.0;
            double formulationPerKg = (cfg.getFormulationFeeType() == ChargesConfig.FeeBasis.PER_KG)   ? safe(cfg.getFormulationFee()) : 0.0;
            double pelletingPerBatch   = (cfg.getPelletingFeeType()   == ChargesConfig.FeeBasis.PER_BATCH) ? safe(cfg.getPelletingFee())   : 0.0;
            double formulationPerBatch = (cfg.getFormulationFeeType() == ChargesConfig.FeeBasis.PER_BATCH) ? safe(cfg.getFormulationFee()) : 0.0;
            double systemPercent = safe(cfg.getSystemFeePercent());
        
            pelletingFeeTotal   = round2(qtyKg * pelletingPerKg) + pelletingPerBatch;
            formulationFeeTotal = round2(qtyKg * formulationPerKg) + formulationPerBatch;
            systemFeeTotal      = round2(baseCost * (systemPercent / 100.0));
        }

        final double grandTotal = round2(baseCost + pelletingFeeTotal + formulationFeeTotal + systemFeeTotal);

        // --- 3) Build & save invoice ---
        Invoice inv = new Invoice();
        inv.setCustomerId(dto.getCustomerId());
        inv.setCustomerName(dto.getCustomerName());
        inv.setServiceType(feeTypeDisplayName); // store the config name as you do now
        inv.setBatchId(dto.getBatchId());

        inv.setAmount(grandTotal);          // authoritative total
        inv.setStatus("Unpaid");
        inv.setDateIssued(LocalDateTime.now());
        inv.setPaid(false);
        inv.setAmountPaid(0.0);
        inv.setUpdatedAt(LocalDateTime.now());

        return invoiceRepo.save(inv);
    }

    /* -------------------- READ / UPDATE -------------------- */

    public List<Invoice> getAllInvoices() {
        return invoiceRepo.findAll();
    }

    public Invoice getInvoice(Long id) {
        return invoiceRepo.findById(id).orElseThrow(() -> new RuntimeException("Invoice not found"));
    }

    public List<Invoice> getInvoicesByCustomer(Long customerId) {
        return invoiceRepo.findByCustomerId(customerId);
    }

    public void deleteInvoice(Long id) {
        invoiceRepo.deleteById(id);
    }

    public Invoice updateStatus(Long id, String status) {
        Invoice invoice = invoiceRepo.findById(id).orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoice.setStatus(status);
        invoice.setUpdatedAt(LocalDateTime.now());
        return invoiceRepo.save(invoice);
    }

    public List<String> getUnpaidCustomerNames() {
        return invoiceRepo.findDistinctCustomerNamesByStatus("Unpaid");
    }

    public Invoice markAsPaid(Long id, Payment payment) {
        Invoice invoice = getInvoice(id);
        payment.setInvoice(invoice);
        paymentRepository.save(payment);

        invoice.setPaid(true);
        invoice.setAmountPaid(invoice.getAmount());
        invoice.setPaymentDate(payment.getPaymentDate());

        return invoiceRepo.save(invoice);
    }

    /* =================== helpers =================== */

    private ChargesConfig resolveChargesConfig(String key) {
        if (key == null || key.isBlank()) return null;

        // Try as ID first
        try {
            Long id = Long.valueOf(key);
            Optional<ChargesConfig> byId = chargesRepo.findById(id);
            if (byId.isPresent()) return byId.get();
        } catch (NumberFormatException ignored) { }

        // Then try by NAME (make sure repository has this)
        return chargesRepo.findByNameIgnoreCase(key).orElse(null);
    }

    private double safe(Double v) {
        return v == null ? 0.0 : v;
    }

    private double round2(double v) {
        return Math.round((v + 1e-9) * 100.0) / 100.0;
    }

    /**
     * Fallback for formulations where costPerKg isn't persisted yet.
     * Computes: sum(ingredientKg * ingredientCostPerKg) / batchSize
     */
    private double computeCostPerKgFromIngredients(Formulation f) {
        if (f == null || f.getIngredients() == null || f.getIngredients().isEmpty() || f.getBatchSize() <= 0) {
            return 0.0;
        }
        double total = 0.0;
        for (FormulationIngredient fi : f.getIngredients()) {
            double kg = fi.getQuantityKg() > 0 ? fi.getQuantityKg()
                    : (fi.getPercentage() != null ? (fi.getPercentage() * f.getBatchSize() / 100.0) : 0.0);

            double cpk = fi.getCostPerKg() > 0 ? fi.getCostPerKg()
                    : (fi.getRawMaterial() != null && fi.getRawMaterial().getCostPerKg() != null
                        ? fi.getRawMaterial().getCostPerKg() : 0.0);

            total += kg * cpk;
        }
        return (total > 0) ? round2(total / f.getBatchSize()) : 0.0;
    }
}
