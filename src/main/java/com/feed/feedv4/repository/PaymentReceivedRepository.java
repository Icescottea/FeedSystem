package com.feed.feedv4.repository;

import com.feed.feedv4.model.PaymentReceived;
import com.feed.feedv4.model.PaymentReceived.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentReceivedRepository extends JpaRepository<PaymentReceived, Long> {
    
    Optional<PaymentReceived> findByPaymentNumber(String paymentNumber);
    
    List<PaymentReceived> findByCustomerId(Long customerId);
    
    List<PaymentReceived> findByStatus(PaymentStatus status);
    
    @Query("SELECT pr FROM PaymentReceived pr WHERE " +
           "LOWER(pr.paymentNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(pr.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<PaymentReceived> searchPayments(@Param("search") String search);
    
    @Query("SELECT pr FROM PaymentReceived pr WHERE " +
           "pr.paymentDate BETWEEN :startDate AND :endDate")
    List<PaymentReceived> findByPaymentDateBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT COUNT(pr) FROM PaymentReceived pr WHERE pr.status = :status")
    Long countByStatus(@Param("status") PaymentStatus status);
    
    @Query("SELECT COALESCE(SUM(pr.amountReceived), 0) FROM PaymentReceived pr WHERE pr.status != 'VOID'")
    BigDecimal sumTotalPaymentsReceived();
    
    @Query("SELECT COALESCE(SUM(pr.unusedAmount), 0) FROM PaymentReceived pr WHERE pr.status != 'VOID'")
    BigDecimal sumTotalUnusedAmount();
    
    @Query("SELECT pr FROM PaymentReceived pr WHERE pr.createdBy = :createdBy")
    List<PaymentReceived> findByCreatedBy(@Param("createdBy") String createdBy);
    
    boolean existsByPaymentNumber(String paymentNumber);
}