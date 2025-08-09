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
import java.util.List;

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

    public Invoice createInvoiceFromPelleting(Long batchId) {
        PelletingBatch b = pelletingRepo.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Pelleting batch not found"));
        Formulation f = b.getFormulation();
        if (f == null) throw new RuntimeException("Batch has no formulation");

        // duration
        Long durationMin = null;
        if (b.getStartTime() != null && b.getEndTime() != null) {
            durationMin = Duration.between(b.getStartTime(), b.getEndTime()).toMinutes();
        }

        // resolve customer config
        Long customerId = (b.getCustomerId() != null) ? b.getCustomerId() : f.getCustomerId();
        ChargesConfig cfg = null;
        if (customerId != null) {
            List<ChargesConfig> list = chargesRepo.findByCustomerId(customerId);
            if (!list.isEmpty()) cfg = list.get(0);
        }
        if (cfg == null) {
            cfg = chargesRepo.findTopByOrderByLastUpdatedDesc(); // fallback so you can test now
        }
        if (cfg == null) throw new RuntimeException("No ChargesConfig available");

        // bases
        double qtyKg = (b.getActualYieldKg() > 0 ? b.getActualYieldKg() : b.getTargetQuantityKg());
        double pricePerKg = (f.getCostPerKg() > 0 ? f.getCostPerKg() : 0.0); // per your instruction
        double productValue = qtyKg * pricePerKg;

        // pelleting fee
        double pelletingFeeAmt;
        if ("percentage".equalsIgnoreCase(cfg.getPelletingFeeType())) {
            pelletingFeeAmt = productValue * (cfg.getPelletingFee() / 100.0);
        } else {
            // treat "fixed" as ₹/kg
            pelletingFeeAmt = qtyKg * cfg.getPelletingFee();
        }

        // system fee
        double systemFeeAmt = productValue * (cfg.getSystemFeePercent() / 100.0);

        // formulation fee
        double formulationFeeAmt;
        if ("per_kg".equalsIgnoreCase(cfg.getFormulationFeeType())) {
            formulationFeeAmt = qtyKg * cfg.getFormulationFee();
        } else {
            // per_batch
            formulationFeeAmt = cfg.getFormulationFee();
        }

        double total = pelletingFeeAmt + systemFeeAmt + formulationFeeAmt;

        // build invoice via your existing DTO
        CreateInvoiceDTO dto = new CreateInvoiceDTO();
        dto.setCustomerId(customerId);
        dto.setCustomerName(null); // set if you have it
        dto.setBatchId(b.getId());
        dto.setServiceType("Pelleting+Formulation");
        dto.setQuantityKg(qtyKg);
        dto.setUnitRate(pricePerKg);
        dto.setAmount(total);
        dto.setTaxRate(0.0);
        dto.setDiscount(0.0);

        StringBuilder note = new StringBuilder();
        note.append("Pelleting duration: ").append(durationMin == null ? "-" : durationMin + " min")
            .append(" | PelletingFee=").append(pelletingFeeAmt)
            .append(" | SystemFee=").append(systemFeeAmt)
            .append(" | FormulationFee=").append(formulationFeeAmt);
        dto.setNotes(note.toString());

        return invoiceService.createInvoice(dto);
    }
}
