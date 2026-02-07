package com.feed.feedv4.repository;

import com.feed.feedv4.model.AccountingEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountingEntryRepository extends JpaRepository<AccountingEntry, Long> {
    
    List<AccountingEntry> findByPaymentMadeId(Long paymentMadeId);
    
    @Query("SELECT ae FROM AccountingEntry ae WHERE ae.paymentMade.id = :paymentMadeId ORDER BY ae.sequence ASC")
    List<AccountingEntry> findByPaymentMadeIdOrderBySequence(@Param("paymentMadeId") Long paymentMadeId);
    
    void deleteByPaymentMadeId(Long paymentMadeId);
}