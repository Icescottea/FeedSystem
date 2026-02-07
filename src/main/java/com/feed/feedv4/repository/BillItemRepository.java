package com.feed.feedv4.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.feed.feedv4.model.BillItem;

@Repository
public interface BillItemRepository extends JpaRepository<BillItem, Long> {
    
    List<BillItem> findByBillId(Long billId);
    
    @Query("SELECT bi FROM BillItem bi WHERE bi.bill.id = :billId ORDER BY bi.sequence ASC")
    List<BillItem> findByBillIdOrderBySequence(@Param("billId") Long billId);
    
    void deleteByBillId(Long billId);
}