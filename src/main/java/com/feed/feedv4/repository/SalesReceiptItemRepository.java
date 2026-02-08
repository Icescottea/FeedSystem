package com.feed.feedv4.repository;

import com.feed.feedv4.model.SalesReceiptItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesReceiptItemRepository extends JpaRepository<SalesReceiptItem, Long> {
    
    List<SalesReceiptItem> findBySalesReceiptId(Long salesReceiptId);
    
    @Query("SELECT sri FROM SalesReceiptItem sri WHERE sri.salesReceipt.id = :salesReceiptId ORDER BY sri.sequence ASC")
    List<SalesReceiptItem> findBySalesReceiptIdOrderBySequence(@Param("salesReceiptId") Long salesReceiptId);
    
    void deleteBySalesReceiptId(Long salesReceiptId);
}