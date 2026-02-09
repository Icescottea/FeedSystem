package com.feed.feedv4.repository;

import com.feed.feedv4.model.Quote;
import com.feed.feedv4.model.Quote.QuoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, Long> {
    
    Optional<Quote> findByQuoteNumber(String quoteNumber);
    
    List<Quote> findByCustomerId(Long customerId);
    
    List<Quote> findByStatus(QuoteStatus status);
    
    @Query("SELECT q FROM Quote q WHERE " +
           "LOWER(q.quoteNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Quote> searchQuotes(@Param("search") String search);
    
    @Query("SELECT q FROM Quote q WHERE q.expiryDate < :currentDate AND q.status NOT IN ('ACCEPTED', 'DECLINED', 'EXPIRED')")
    List<Quote> findExpiredQuotes(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT q FROM Quote q WHERE q.quoteDate BETWEEN :startDate AND :endDate")
    List<Quote> findByQuoteDateBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT COUNT(q) FROM Quote q WHERE q.status = :status")
    Long countByStatus(@Param("status") QuoteStatus status);
    
    @Query("SELECT COALESCE(SUM(q.total), 0) FROM Quote q WHERE q.status IN :statuses")
    BigDecimal sumTotalByStatuses(@Param("statuses") List<QuoteStatus> statuses);
    
    @Query("SELECT q FROM Quote q WHERE q.createdBy = :createdBy")
    List<Quote> findByCreatedBy(@Param("createdBy") String createdBy);
    
    boolean existsByQuoteNumber(String quoteNumber);
}