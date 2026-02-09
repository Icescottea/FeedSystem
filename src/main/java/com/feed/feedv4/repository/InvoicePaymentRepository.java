package com.feed.feedv4.repository;

import com.feed.feedv4.model.InvoicePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoicePaymentRepository extends JpaRepository<InvoicePayment, Long> {
    
    List<InvoicePayment> findByPaymentReceivedId(Long paymentReceivedId);
    
    List<InvoicePayment> findByInvoiceId(Long invoiceId);
    
    @Query("SELECT ip FROM InvoicePayment ip WHERE ip.invoiceId = :invoiceId ORDER BY ip.paymentDate DESC")
    List<InvoicePayment> findByInvoiceIdOrderByPaymentDateDesc(@Param("invoiceId") Long invoiceId);
    
    void deleteByPaymentReceivedId(Long paymentReceivedId);
}