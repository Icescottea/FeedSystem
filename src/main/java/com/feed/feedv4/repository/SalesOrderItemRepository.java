package com.feed.feedv4.repository;

import com.feed.feedv4.model.SalesOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesOrderItemRepository extends JpaRepository<SalesOrderItem, Long> {
    
    List<SalesOrderItem> findBySalesOrderId(Long salesOrderId);
    
    @Query("SELECT soi FROM SalesOrderItem soi WHERE soi.salesOrder.id = :salesOrderId ORDER BY soi.sequence ASC")
    List<SalesOrderItem> findBySalesOrderIdOrderBySequence(@Param("salesOrderId") Long salesOrderId);
    
    void deleteBySalesOrderId(Long salesOrderId);
}