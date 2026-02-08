package com.feed.feedv4.repository;

import com.feed.feedv4.model.PaymentMade;
import com.feed.feedv4.model.PaymentMade.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMadeRepository extends JpaRepository<PaymentMade, Long> {
    
    Optional<PaymentMade> findByPaymentNumber(String paymentNumber);
    
    List<PaymentMade> findByVendorId(Long vendorId);
    
    List<PaymentMade> findByStatus(PaymentStatus status);
    
    @Query("SELECT pm FROM PaymentMade pm WHERE " +
           "LOWER(pm.paymentNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(pm.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<PaymentMade> searchPayments(@Param("search") String search);
    
    @Query("SELECT pm FROM PaymentMade pm WHERE " +
           "pm.paymentDate BETWEEN :startDate AND :endDate")
    List<PaymentMade> findByPaymentDateBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT COUNT(pm) FROM PaymentMade pm WHERE pm.status = :status")
    Long countByStatus(@Param("status") PaymentStatus status);
    
    @Query("SELECT COALESCE(SUM(pm.paymentMade), 0) FROM PaymentMade pm WHERE pm.status = 'PAID'")
    BigDecimal sumTotalPaidPayments();
    
    @Query("SELECT COALESCE(SUM(pm.amountInExcess), 0) FROM PaymentMade pm WHERE pm.status = 'PAID'")
    BigDecimal sumTotalUnusedAmount();
    
    boolean existsByPaymentNumber(String paymentNumber);

    @Query("""
        SELECT COALESCE(SUM(p.excessAmount), 0)
        FROM PaymentMade p
        WHERE p.vendor.id = :vendorId
    """)
    BigDecimal sumExcessByVendorId(@Param("vendorId") Long vendorId);
}