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
        // 1) Resolve batch (for qty & cost/kg)
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
                    costPerKg = computeCostPerKgFromIngredients(batch.getFormulation());
                }
            }
        }

        // Manufacturing cost
        final double baseCost = round2(qtyKg * costPerKg);

        // 2) Resolve fee config (by name first, then id, then latest active)
        ChargesConfig cfg = null;
        String feeTypeDisplayName = dto.getServiceType();
        if (feeTypeDisplayName != null) feeTypeDisplayName = feeTypeDisplayName.trim();

        if (feeTypeDisplayName != null && !feeTypeDisplayName.isEmpty()) {
            cfg = chargesRepo.findByNameIgnoreCase(feeTypeDisplayName).orElse(null);
            if (cfg == null) {
                try {
                    Long cfgId = Long.valueOf(feeTypeDisplayName);
                    cfg = chargesRepo.findById(cfgId).orElse(null);
                } catch (NumberFormatException ignored) { }
            }
        }
        if (cfg == null) {
            cfg = chargesRepo.findTopByActiveTrueAndArchivedFalseOrderByUpdatedAtDesc()
                    .orElseGet(() -> chargesRepo.findTopByActiveTrueAndArchivedFalseOrderByCreatedAtDesc()
                            .orElse(null));
        }

        // 3) Calculate fees
        double pelletingFeeTotal = 0, formulationFeeTotal = 0, systemFeeTotal = 0;
        if (cfg != null) {
            if (feeTypeDisplayName == null || feeTypeDisplayName.isBlank()) {
                feeTypeDisplayName = cfg.getName();
            }

            double pelletingPerKg      = (cfg.getPelletingFeeType()   == ChargesConfig.FeeBasis.PER_KG)    ? safe(cfg.getPelletingFee())   : 0.0;
            double formulationPerKg    = (cfg.getFormulationFeeType() == ChargesConfig.FeeBasis.PER_KG)    ? safe(cfg.getFormulationFee()) : 0.0;
            double pelletingPerBatch   = (cfg.getPelletingFeeType()   == ChargesConfig.FeeBasis.PER_BATCH) ? safe(cfg.getPelletingFee())   : 0.0;
            double formulationPerBatch = (cfg.getFormulationFeeType() == ChargesConfig.FeeBasis.PER_BATCH) ? safe(cfg.getFormulationFee()) : 0.0;
            double systemPercent       = safe(cfg.getSystemFeePercent());

            pelletingFeeTotal   = round2(qtyKg * pelletingPerKg) + pelletingPerBatch;
            formulationFeeTotal = round2(qtyKg * formulationPerKg) + formulationPerBatch;
            systemFeeTotal      = round2(baseCost * (systemPercent / 100.0));
        }

        // 4) Subtotal (base + fees)
        final double subtotal = round2(baseCost + pelletingFeeTotal + formulationFeeTotal + systemFeeTotal);

        // 5) Apply discount (Rs) then tax (%) and persist those fields
        //    (DTO fields are primitives in your code; treat missing as 0)
        double discount = safe(dto.getDiscount());
        double taxRate  = safe(dto.getTaxRate());

        double afterDiscount = Math.max(0d, subtotal - discount);
        double taxAmount     = round2(afterDiscount * (taxRate / 100.0));
        double finalTotal    = round2(afterDiscount + taxAmount);

        // 6) Build & save invoice
        Invoice inv = new Invoice();
        inv.setCustomerId(dto.getCustomerId());
        inv.setCustomerName(dto.getCustomerName());
        inv.setServiceType(feeTypeDisplayName);
        inv.setBatchId(dto.getBatchId());

        inv.setDiscount(discount);     // persist for display / PDF
        inv.setTaxRate(taxRate);       // persist for display / PDF
        inv.setAmount(finalTotal);     // authoritative grand total (after discount & tax)

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

    private double safe(Double v) {
        return v == null ? 0.0 : v;
    }

    // Overload for primitives (in case DTO uses double)
    private double safe(double v) {
        return Double.isNaN(v) || Double.isInfinite(v) ? 0.0 : v;
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
