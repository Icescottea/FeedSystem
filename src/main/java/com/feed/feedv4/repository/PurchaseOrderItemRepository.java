package com.feed.feedv4.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.feed.feedv4.model.PurchaseOrderItem;

@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {
    
    List<PurchaseOrderItem> findByPurchaseOrderId(Long purchaseOrderId);
    
    @Query("SELECT poi FROM PurchaseOrderItem poi WHERE poi.purchaseOrder.id = :purchaseOrderId ORDER BY poi.sequence ASC")
    List<PurchaseOrderItem> findByPurchaseOrderIdOrderBySequence(@Param("purchaseOrderId") Long purchaseOrderId);
    
    void deleteByPurchaseOrderId(Long purchaseOrderId);
}