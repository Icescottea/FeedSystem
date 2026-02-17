package com.feed.feedv4.repository;

import com.feed.feedv4.model.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {

    List<InvoiceItem> findByInvoiceId(Long invoiceId);

    @Query("SELECT ii FROM InvoiceItem ii WHERE ii.invoice.id = :invoiceId ORDER BY ii.sequence ASC")
    List<InvoiceItem> findByInvoiceIdOrderBySequence(@Param("invoiceId") Long invoiceId);

    void deleteByInvoiceId(Long invoiceId);
}