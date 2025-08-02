package com.feed.feedv4.service;

import com.feed.feedv4.dto.CreateInvoiceDTO;
import com.feed.feedv4.model.Invoice;
import com.feed.feedv4.model.Payment;
import com.feed.feedv4.repository.InvoiceRepository;
import com.feed.feedv4.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepo;

    @Autowired
    private PaymentRepository paymentRepository;

    public Invoice createInvoice(CreateInvoiceDTO dto) {
        Invoice invoice = new Invoice();
        invoice.setCustomerName(dto.getCustomerName());
        invoice.setDateIssued(LocalDateTime.now());
        invoice.setServiceType(dto.getServiceType());
        invoice.setBatchId(dto.getBatchId());
        invoice.setAmount(dto.getAmount());
        invoice.setStatus("Unpaid");
        return invoiceRepo.save(invoice);
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepo.findAll();
    }

    public Invoice getInvoice(Long id) {
        return invoiceRepo.findById(id).orElseThrow(() -> new RuntimeException("Invoice not found"));
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

}
