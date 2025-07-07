package com.feed.feedv4.service;

import com.feed.feedv4.dto.CreatePaymentDTO;
import com.feed.feedv4.model.Invoice;
import com.feed.feedv4.model.Payment;
import com.feed.feedv4.repository.InvoiceRepository;
import com.feed.feedv4.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepo;

    @Autowired
    private InvoiceRepository invoiceRepo;

    public List<Payment> getAllPayments() {
        return paymentRepo.findAll();
    }

    public Payment getPaymentsById(Long id) {
        return paymentRepo.findById(id).orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public Payment getById(Long id) {
        return paymentRepo.findById(id).orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public Payment createPayment(CreatePaymentDTO dto) {
        Invoice invoice = invoiceRepo.findById(dto.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setAmountPaid(dto.getAmountPaid());
        payment.setPaymentDate(dto.getPaymentDate() != null ? dto.getPaymentDate() : LocalDateTime.now());
        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setNotes(dto.getNotes());

        invoice.setAmountPaid(invoice.getPaidAmount() + dto.getAmountPaid());
        if (invoice.getPaidAmount() >= invoice.getTotalAmount()) {
            invoice.setStatus("Paid");
        } else {
            invoice.setStatus("Partially Paid");
        }

        invoiceRepo.save(invoice);
        return paymentRepo.save(payment);
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

}
