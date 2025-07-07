package com.feed.feedv4.repository;

import com.feed.feedv4.model.Payment;
import com.feed.feedv4.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoice(Invoice invoice);
    List<Payment> findByInvoiceId(Long invoiceId);
}
