package com.feed.feedv4.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.feed.feedv4.model.PurchaseOrder;
import com.feed.feedv4.model.PurchaseOrder.BilledStatus;
import com.feed.feedv4.model.PurchaseOrder.PurchaseOrderStatus;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    
    Optional<PurchaseOrder> findByPurchaseOrderNumber(String purchaseOrderNumber);
    
    List<PurchaseOrder> findByVendorId(Long vendorId);
    
    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);
    
    List<PurchaseOrder> findByBilledStatus(BilledStatus billedStatus);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE " +
           "LOWER(po.purchaseOrderNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(po.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<PurchaseOrder> searchPurchaseOrders(@Param("search") String search);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE " +
           "po.status = :status AND po.billedStatus = :billedStatus")
    List<PurchaseOrder> findByStatusAndBilledStatus(
        @Param("status") PurchaseOrderStatus status,
        @Param("billedStatus") BilledStatus billedStatus
    );
    
    @Query("SELECT po FROM PurchaseOrder po WHERE " +
           "po.orderDate BETWEEN :startDate AND :endDate")
    List<PurchaseOrder> findByOrderDateBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.status = :status")
    Long countByStatus(@Param("status") PurchaseOrderStatus status);
    
    @Query("SELECT COALESCE(SUM(po.total), 0) FROM PurchaseOrder po WHERE po.status IN :statuses")
    java.math.BigDecimal sumTotalByStatuses(@Param("statuses") List<PurchaseOrderStatus> statuses);
    
    boolean existsByPurchaseOrderNumber(String purchaseOrderNumber);
}