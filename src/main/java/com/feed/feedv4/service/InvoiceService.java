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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepo;
    private final PelletingBatchRepository batchRepo;
    private final ChargesConfigRepository chargesRepo;
    private final PaymentRepository paymentRepository; // <-- make sure you have this

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
        // 1) Resolve batch (optional but recommended)
        PelletingBatch batch = null;
        double qtyKg = 0;
        double costPerKg = 0;

        if (dto.getBatchId() != null) {
            // prefer a fetch that joins formulation to avoid N+1
            batch = batchRepo.findWithFormulationById(dto.getBatchId())
                    .orElseThrow(() -> new RuntimeException("Batch not found: " + dto.getBatchId()));

            qtyKg = (batch.getActualYieldKg() > 0 ? batch.getActualYieldKg()
                    : (batch.getTargetQuantityKg() > 0 ? batch.getTargetQuantityKg() : 0));

            if (batch.getFormulation() != null) {
                costPerKg = safe(batch.getFormulation().getCostPerKg());
                // if costPerKg missing, try to compute from ingredients as a fallback
                if (costPerKg <= 0) {
                    costPerKg = computeCostPerKgFromIngredients(batch.getFormulation());
                }
            }
        }

        // 2) Base cost
        final double baseCost = round2(qtyKg * costPerKg);

        // 3) Fees from ChargesConfig (by id) — adjust field names if yours differ
        double pelletingPerKg = 0, formulationPerKg = 0, systemPercent = 0;
        String feeTypeDisplayName = dto.getServiceType(); // keep the name you already store

        if (dto.getServiceType() != null) {
            Long cfgId = Long.valueOf(dto.getServiceType());
            ChargesConfig cfg = chargesRepo.findById(cfgId)
                    .orElseThrow(() -> new RuntimeException("ChargesConfig not found: " + dto.getServiceType()));

            // ---- ADAPT THESE 3 LINES TO YOUR EXACT FIELD NAMES ----
            pelletingPerKg   = safe(cfg.getPelletingFee());     // e.g. getPelletingPerKg()
            formulationPerKg = safe(cfg.getFormulationFee());   // e.g. getFormulationPerKg()
            systemPercent    = safe(cfg.getSystemFeePercent());      // e.g. getSystemPercent()

            if (feeTypeDisplayName == null || feeTypeDisplayName.isBlank()) {
                feeTypeDisplayName = cfg.getName(); // show config name on invoice
            }
        }

        double pelletingFee   = round2(qtyKg * pelletingPerKg);
        double formulationFee = round2(qtyKg * formulationPerKg);
        double systemFee      = round2(baseCost * (systemPercent / 100.0));

        // 4) Total
        final double total = round2(baseCost + pelletingFee + formulationFee + systemFee);

        // 5) Build + save invoice (server is source of truth for amount)
        Invoice inv = new Invoice();
        inv.setCustomerId(dto.getCustomerId());
        inv.setCustomerName(dto.getCustomerName());
        inv.setServiceType(feeTypeDisplayName);
        inv.setBatchId(dto.getBatchId());

        inv.setAmount(total);               // <- authoritative total
        inv.setStatus("Unpaid");
        inv.setDateIssued(LocalDateTime.now());
        inv.setPaid(false);
        inv.setAmountPaid(0.0);
        inv.setUpdatedAt(LocalDateTime.now());

        return invoiceRepo.save(inv);
    }

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
