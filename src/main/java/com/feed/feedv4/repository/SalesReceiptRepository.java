package com.feed.feedv4.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.feed.feedv4.model.SalesReceipt;
import com.feed.feedv4.model.SalesReceipt.PaymentMode;
import com.feed.feedv4.model.SalesReceipt.SalesReceiptStatus;

@Repository
public interface SalesReceiptRepository extends JpaRepository<SalesReceipt, Long> {
    
    Optional<SalesReceipt> findBySalesReceiptNumber(String salesReceiptNumber);
    
    List<SalesReceipt> findByCustomerId(Long customerId);
    
    List<SalesReceipt> findByStatus(SalesReceiptStatus status);
    
    List<SalesReceipt> findByPaymentMode(PaymentMode paymentMode);
    
    @Query("SELECT sr FROM SalesReceipt sr WHERE " +
           "LOWER(sr.salesReceiptNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(sr.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<SalesReceipt> searchSalesReceipts(@Param("search") String search);
    
    @Query("SELECT sr FROM SalesReceipt sr WHERE " +
           "sr.receiptDate BETWEEN :startDate AND :endDate")
    List<SalesReceipt> findByReceiptDateBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT COUNT(sr) FROM SalesReceipt sr WHERE sr.status = :status")
    Long countByStatus(@Param("status") SalesReceiptStatus status);
    
    @Query("SELECT COALESCE(SUM(sr.total), 0) FROM SalesReceipt sr WHERE sr.status = 'COMPLETED'")
    BigDecimal sumTotalCompletedReceipts();
    
    @Query("SELECT COALESCE(SUM(sr.total), 0) FROM SalesReceipt sr WHERE sr.status = :status")
    BigDecimal sumTotalByStatus(@Param("status") SalesReceiptStatus status);
    
    @Query("SELECT sr FROM SalesReceipt sr WHERE sr.createdBy = :createdBy")
    List<SalesReceipt> findByCreatedBy(@Param("createdBy") String createdBy);
    
    boolean existsBySalesReceiptNumber(String salesReceiptNumber);

    @Query("SELECT COUNT(s) FROM SalesReceipt s WHERE s.salesReceiptNumber LIKE :prefix%")
    long countByReceiptNumberStartingWith(@Param("prefix") String prefix);
}