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
        // 1) Resolve batch (optional)
        PelletingBatch batch = null;
        double qtyKg = n(dto.getQuantityKg()); // allow override from DTO, else derive from batch
        double costPerKg = 0.0;

        if (dto.getBatchId() != null) {
            batch = batchRepo.findWithFormulationById(dto.getBatchId())
                    .orElseThrow(() -> new RuntimeException("Batch not found: " + dto.getBatchId()));

            if (qtyKg <= 0) {
                qtyKg = (batch.getActualYieldKg() > 0 ? batch.getActualYieldKg()
                        : (batch.getTargetQuantityKg() > 0 ? batch.getTargetQuantityKg() : 0));
            }

            if (batch.getFormulation() != null) {
                costPerKg = n(batch.getFormulation().getCostPerKg());
                if (costPerKg <= 0) {
                    costPerKg = computeCostPerKgFromIngredients(batch.getFormulation());
                }
            }
        }

        // 2) Base (manufacturing) cost from formulation
        final double baseCost = round2(qtyKg * costPerKg);

        // 3) Load charges config (serviceType is a NAME in your system)
        String feeTypeDisplayName = dto.getServiceType();
        double pelletingPerKg = 0, formulationPerKg = 0, systemPercent = 0;

        ChargesConfig cfg = resolveChargesConfig(dto.getServiceType());
        if (cfg != null) {
            pelletingPerKg   = n(cfg.getPelletingFee());        // adapt to your field names if different
            formulationPerKg = n(cfg.getFormulationFee());      // adapt to your field names if different
            systemPercent    = n(cfg.getSystemFeePercent());    // adapt to your field names if different

            if (feeTypeDisplayName == null || feeTypeDisplayName.isBlank()) {
                feeTypeDisplayName = cfg.getName();
            }
        }

        // 4) Fees based on config
        final double pelletingFee   = round2(qtyKg * pelletingPerKg);
        final double formulationFee = round2(qtyKg * formulationPerKg);
        final double systemFee      = round2(baseCost * (systemPercent / 100.0));

        // 5) GRAND TOTAL = base manufacturing cost + all fees
        final double grandTotal = round2(baseCost + pelletingFee + formulationFee + systemFee);

        // 6) Build + save invoice
        Invoice inv = new Invoice();
        inv.setCustomerId(dto.getCustomerId());
        inv.setCustomerName(dto.getCustomerName());
        inv.setServiceType(feeTypeDisplayName); // storing config name as before
        inv.setBatchId(dto.getBatchId());
        inv.setAmount(grandTotal);              // server-authoritative total
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

    private double n(Double v) {
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
