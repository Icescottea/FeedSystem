package com.feed.feedv4.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.feed.feedv4.model.ExpenseAccountingEntry;

@Repository
public interface ExpenseAccountingEntryRepository extends JpaRepository<ExpenseAccountingEntry, Long> {
    
    List<ExpenseAccountingEntry> findByExpenseId(Long expenseId);
    
    @Query("SELECT eae FROM ExpenseAccountingEntry eae WHERE eae.expense.id = :expenseId ORDER BY eae.sequence ASC")
    List<ExpenseAccountingEntry> findByExpenseIdOrderBySequence(@Param("expenseId") Long expenseId);
    
    void deleteByExpenseId(Long expenseId);
}