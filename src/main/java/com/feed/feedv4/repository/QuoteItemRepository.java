package com.feed.feedv4.repository;

import com.feed.feedv4.model.QuoteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuoteItemRepository extends JpaRepository<QuoteItem, Long> {
    
    List<QuoteItem> findByQuoteId(Long quoteId);
    
    @Query("SELECT qi FROM QuoteItem qi WHERE qi.quote.id = :quoteId ORDER BY qi.sequence ASC")
    List<QuoteItem> findByQuoteIdOrderBySequence(@Param("quoteId") Long quoteId);
    
    void deleteByQuoteId(Long quoteId);
}