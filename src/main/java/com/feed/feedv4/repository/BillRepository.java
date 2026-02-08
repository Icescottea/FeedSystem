package com.feed.feedv4.repository;

import com.feed.feedv4.model.Bill;
import com.feed.feedv4.model.Bill.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    
    Optional<Bill> findByBillNumber(String billNumber);
    
    List<Bill> findByVendorId(Long vendorId);
    
    List<Bill> findByStatus(BillStatus status);
    
    @Query("SELECT b FROM Bill b WHERE b.vendorId = :vendorId AND b.balanceDue > 0 AND b.status NOT IN ('VOID', 'PAID')")
    List<Bill> findOutstandingBillsByVendorId(@Param("vendorId") Long vendorId);
    
    @Query("SELECT b FROM Bill b WHERE " +
           "LOWER(b.billNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Bill> searchBills(@Param("search") String search);
    
    @Query("SELECT b FROM Bill b WHERE b.dueDate < :currentDate AND b.balanceDue > 0 AND b.status NOT IN ('VOID', 'PAID')")
    List<Bill> findOverdueBills(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT b FROM Bill b WHERE b.billDate BETWEEN :startDate AND :endDate")
    List<Bill> findByBillDateBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT COUNT(b) FROM Bill b WHERE b.status = :status")
    Long countByStatus(@Param("status") BillStatus status);
    
    @Query("SELECT COALESCE(SUM(b.balanceDue), 0) FROM Bill b WHERE b.status NOT IN ('VOID', 'PAID')")
    BigDecimal sumTotalBalanceDue();
    
    @Query("SELECT COALESCE(SUM(b.total), 0) FROM Bill b WHERE b.status IN :statuses")
    BigDecimal sumTotalByStatuses(@Param("statuses") List<BillStatus> statuses);
    
    boolean existsByBillNumber(String billNumber);

    public BigDecimal sumOutstandingByVendorId(Long vendorId);
}