package com.feed.feedv4.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.feed.feedv4.model.Invoice;
import com.feed.feedv4.model.InvoiceStatus;
import com.feed.feedv4.model.PaymentStatus;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    List<Invoice> findByCustomerId(Long customerId);

    List<Invoice> findByStatus(InvoiceStatus status);

    List<Invoice> findByPaymentStatus(PaymentStatus paymentStatus);

    boolean existsByInvoiceNumber(String invoiceNumber);

    boolean existsByCustomerId(Long customerId);

    @Query("""
        SELECT COALESCE(SUM(i.balanceDue), 0)
        FROM Invoice i
        WHERE i.customerId = :customerId
          AND i.balanceDue > 0
    """)
    BigDecimal sumOutstandingByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT i FROM Invoice i WHERE " +
           "LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.orderNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Invoice> searchInvoices(@Param("search") String search);

    @Query("SELECT i FROM Invoice i WHERE i.invoiceDate BETWEEN :startDate AND :endDate")
    List<Invoice> findByInvoiceDateBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(i.total), 0) FROM Invoice i WHERE i.status != 'VOID'")
    BigDecimal sumTotalInvoices();

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = :status")
    Long countByStatus(@Param("status") InvoiceStatus status);

    List<Invoice> findByCustomerIdAndBalanceDueGreaterThan(Long customerId, BigDecimal amount);
}