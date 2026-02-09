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
import com.feed.feedv4.model.Invoice.InvoiceStatus;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    
    List<Invoice> findByCustomerId(Long customerId);
    
    List<Invoice> findByStatus(InvoiceStatus status);
    
    @Query("SELECT i FROM Invoice i WHERE i.customerId = :customerId AND i.balanceDue > 0 AND i.status NOT IN ('VOID', 'PAID')")
    List<Invoice> findOutstandingInvoicesByCustomerId(@Param("customerId") Long customerId);
    
    @Query("SELECT i FROM Invoice i WHERE " +
           "LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.orderNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Invoice> searchInvoices(@Param("search") String search);
    
    @Query("SELECT i FROM Invoice i WHERE i.dueDate < :currentDate AND i.balanceDue > 0 AND i.status NOT IN ('VOID', 'PAID')")
    List<Invoice> findOverdueInvoices(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT i FROM Invoice i WHERE i.invoiceDate BETWEEN :startDate AND :endDate")
    List<Invoice> findByInvoiceDateBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = :status")
    Long countByStatus(@Param("status") InvoiceStatus status);
    
    @Query("SELECT COALESCE(SUM(i.balanceDue), 0) FROM Invoice i WHERE i.status NOT IN ('VOID', 'PAID')")
    BigDecimal sumTotalBalanceDue();
    
    @Query("SELECT COALESCE(SUM(i.total), 0) FROM Invoice i WHERE i.status IN :statuses")
    BigDecimal sumTotalByStatuses(@Param("statuses") List<InvoiceStatus> statuses);
    
    @Query("SELECT COALESCE(SUM(i.balanceDue), 0) FROM Invoice i WHERE i.customerId = :customerId AND i.status NOT IN ('VOID', 'PAID')")
    BigDecimal sumOutstandingByCustomerId(@Param("customerId") Long customerId);
    
    boolean existsByInvoiceNumber(String invoiceNumber);
}