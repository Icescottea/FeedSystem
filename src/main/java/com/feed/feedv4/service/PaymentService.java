package com.feed.feedv4.service;

import com.feed.feedv4.dto.CreatePaymentDTO;
import com.feed.feedv4.model.Invoice;
import com.feed.feedv4.model.Payment;
import com.feed.feedv4.repository.InvoiceRepository;
import com.feed.feedv4.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepo;
    private final InvoiceRepository invoiceRepo;

    public PaymentService(PaymentRepository paymentRepo, InvoiceRepository invoiceRepo) {
        this.paymentRepo = paymentRepo;
        this.invoiceRepo = invoiceRepo;
    }

    public List<Payment> getAllPayments() {
        return paymentRepo.findAll();
    }

    public Payment getById(Long id) {
        return paymentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public List<Payment> getPaymentsForInvoice(Long invoiceId) {
        return paymentRepo.findByInvoiceId(invoiceId);
    }

    public void delete(Long id) {
        if (!paymentRepo.existsById(id)) {
            throw new RuntimeException("Payment not found");
        }
        paymentRepo.deleteById(id);
    }

    /**
     * Creates a payment, persists tax/discount, and updates the linked invoice totals + status.
     * Rules:
     * - If taxRate/discountAmount provided: compute finalAmount = base + base*tax% - discount
     * - Else, use dto.amountPaid as finalAmount
     * - Never allow negative or zero finalAmount
     * - Cap finalAmount at remaining due to avoid overpay drift
     */
    @Transactional
    public Payment createPayment(CreatePaymentDTO dto) {
        Invoice invoice = invoiceRepo.findById(dto.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Base and already paid
        double baseAmount = safe(invoice.getTotalAmount());      // maps to invoice.amount via your getter
        double alreadyPaid = safe(invoice.getPaidAmount());      // maps to invoice.amountPaid via your getter
        double remaining = Math.max(0d, baseAmount - alreadyPaid);

        // Compute final amount to apply
        Double taxRate = dto.getTaxRate();               // % (nullable)
        Double discountAmount = dto.getDiscountAmount(); // absolute (nullable)

        double finalAmount;
        if (taxRate != null || discountAmount != null) {
            double tax = (taxRate != null ? taxRate : 0d) * baseAmount / 100d;
            double disc = (discountAmount != null ? discountAmount : 0d);
            finalAmount = baseAmount + tax - disc;
        } else {
            finalAmount = safe(dto.getAmountPaid());
        }

        if (finalAmount <= 0d) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }

        // Cap to remaining due (prevents overpayment drift)
        double applied = Math.min(finalAmount, remaining);

        // Build payment
        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setAmountPaid(applied);
        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setNotes(dto.getNotes());
        payment.setTaxRate(taxRate);
        payment.setDiscountAmount(discountAmount);
        payment.setPaymentDate(dto.getPaymentDate() != null ? dto.getPaymentDate() : LocalDateTime.now());

        // Update invoice totals/status
        double newPaidTotal = alreadyPaid + applied;
        invoice.setAmountPaid(newPaidTotal); // your model exposes setAmountPaid(...) and getPaidAmount()
        invoice.setUpdatedAt(LocalDateTime.now());

        if (newPaidTotal >= baseAmount) {
            invoice.setStatus("Paid");
            if (hasPaidFlag(invoice)) invoice.setPaid(true);
        } else if (newPaidTotal > 0d) {
            invoice.setStatus("Partially Paid");
            if (hasPaidFlag(invoice)) invoice.setPaid(false);
        } else {
            invoice.setStatus("Unpaid");
            if (hasPaidFlag(invoice)) invoice.setPaid(false);
        }

        // Persist
        paymentRepo.save(payment);
        invoiceRepo.save(invoice);

        return payment;
    }

    private static double safe(Double v) {
        return v == null ? 0d : v;
    }

    // Helper to avoid NoSuchMethod if your Invoice doesn’t have a boolean paid field
    private static boolean hasPaidFlag(Invoice inv) {
        try {
            inv.getClass().getDeclaredMethod("setPaid", boolean.class);
            return true;
        } catch (NoSuchMethodException e) {
            return false;
        }
    }
}
