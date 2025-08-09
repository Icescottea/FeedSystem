package com.feed.feedv4.service;

import com.feed.feedv4.dto.CreateInvoiceDTO;
import com.feed.feedv4.model.ChargesConfig;
import com.feed.feedv4.model.Formulation;
import com.feed.feedv4.model.Invoice;
import com.feed.feedv4.model.PelletingBatch;
import com.feed.feedv4.repository.ChargesConfigRepository;
import com.feed.feedv4.repository.PelletingBatchRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class PelletingInvoicingService {

    private final PelletingBatchRepository pelletingRepo;
    private final ChargesConfigRepository chargesRepo;
    private final InvoiceService invoiceService;

    public PelletingInvoicingService(PelletingBatchRepository pelletingRepo,
                                     ChargesConfigRepository chargesRepo,
                                     InvoiceService invoiceService) {
        this.pelletingRepo = pelletingRepo;
        this.chargesRepo = chargesRepo;
        this.invoiceService = invoiceService;
    }

    private static final class Fee {
        final double rate;      // numeric value
        final boolean percent;  // true = % of product value; false = ₹/kg
        Fee(double rate, boolean percent) { this.rate = rate; this.percent = percent; }
    }

    private Fee resolveFee(Long customerId, String serviceType) {
        final String normalized = serviceType == null ? "" : serviceType.trim().toUpperCase();

        ChargesConfig cfg = null;
        if (customerId != null) {
            cfg = chargesRepo
                    .findTopByCustomerIdAndServiceTypeOrderByLastUpdatedDesc(customerId, normalized)
                    .orElse(null);
        }
        if (cfg == null) {
            cfg = chargesRepo
                    .findTopByServiceTypeOrderByLastUpdatedDesc(normalized)
                    .orElse(null);
        }
        if (cfg == null) return new Fee(0.0, false);
        return new Fee(cfg.getRate(), cfg.isPercentage());
    }

    public Invoice createInvoiceFromPelleting(Long batchId) {
        PelletingBatch b = pelletingRepo.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Pelleting batch not found"));
        Formulation f = b.getFormulation();
        if (f == null) throw new RuntimeException("Batch has no formulation");

        // duration (minutes)
        Long durationMin = null;
        if (b.getStartTime() != null && b.getEndTime() != null) {
            durationMin = Duration.between(b.getStartTime(), b.getEndTime()).toMinutes();
        }

        // try batch.customerId only (no dependency on formulation having customerId)
        Long customerId = b.getCustomerId();

        // bases
        double qtyKg = (b.getActualYieldKg() > 0 ? b.getActualYieldKg() : b.getTargetQuantityKg());
        double pricePerKg = (f.getCostPerKg() > 0 ? f.getCostPerKg() : 0.0);
        double productValue = qtyKg * pricePerKg;

        // fees using simplified config (serviceType/rate/percentage)
        Fee pelleting = resolveFee(customerId, "PELLETING");
        double pelletingAmt = pelleting.percent
                ? productValue * (pelleting.rate / 100.0)
                : qtyKg * pelleting.rate; // ₹/kg

        Fee system = resolveFee(customerId, "SYSTEM");
        double systemAmt = productValue * (system.rate / 100.0); // treat as percent

        Fee formulation = resolveFee(customerId, "FORMULATION");
        double formulationAmt = qtyKg * formulation.rate; // per-kg

        double total = pelletingAmt + systemAmt + formulationAmt;

        // build invoice via existing service/DTO
        CreateInvoiceDTO dto = new CreateInvoiceDTO();
        dto.setCustomerId(customerId);
        dto.setCustomerName(null);
        dto.setBatchId(b.getId());
        dto.setServiceType("Pelleting+Formulation");
        dto.setQuantityKg(qtyKg);
        dto.setUnitRate(pricePerKg);
        dto.setAmount(total);
        dto.setTaxRate(0.0);
        dto.setDiscount(0.0);

        StringBuilder notes = new StringBuilder();
        notes.append("Pelleting duration: ").append(durationMin == null ? "-" : durationMin + " min")
             .append(" | Pelleting=").append(pelletingAmt)
             .append(" | System=").append(systemAmt)
             .append(" | Formulation=").append(formulationAmt);
        dto.setNotes(notes.toString());

        return invoiceService.createInvoice(dto);
    }
}
