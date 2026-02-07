package com.feed.feedv4.repository;

import com.feed.feedv4.model.BillPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillPaymentRepository extends JpaRepository<BillPayment, Long> {
    
    List<BillPayment> findByPaymentMadeId(Long paymentMadeId);
    
    List<BillPayment> findByBillId(Long billId);
    
    @Query("SELECT bp FROM BillPayment bp WHERE bp.billId = :billId ORDER BY bp.paymentDate DESC")
    List<BillPayment> findByBillIdOrderByPaymentDateDesc(@Param("billId") Long billId);
    
    void deleteByPaymentMadeId(Long paymentMadeId);
}