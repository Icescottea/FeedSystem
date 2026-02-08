package com.feed.feedv4.repository;

import com.feed.feedv4.model.Expense;
import com.feed.feedv4.model.Expense.ExpenseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    Optional<Expense> findByReferenceNumber(String referenceNumber);
    
    List<Expense> findByVendorId(Long vendorId);
    
    List<Expense> findByCustomerId(Long customerId);
    
    List<Expense> findByStatus(ExpenseStatus status);
    
    @Query("SELECT e FROM Expense e WHERE " +
           "LOWER(e.expenseAccount) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.vendorName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.customerName) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Expense> searchExpenses(@Param("search") String search);
    
    @Query("SELECT e FROM Expense e WHERE e.date BETWEEN :startDate AND :endDate")
    List<Expense> findByDateBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT COUNT(e) FROM Expense e WHERE e.status = :status")
    Long countByStatus(@Param("status") ExpenseStatus status);
    
    @Query("SELECT COALESCE(SUM(e.netAmount), 0) FROM Expense e")
    BigDecimal sumTotalExpenses();
    
    @Query("SELECT COALESCE(SUM(e.netAmount), 0) FROM Expense e WHERE e.status = :status")
    BigDecimal sumTotalByStatus(@Param("status") ExpenseStatus status);
    
    @Query("SELECT e FROM Expense e WHERE e.expenseAccount = :account")
    List<Expense> findByExpenseAccount(@Param("account") String account);
    
    @Query("SELECT e FROM Expense e WHERE e.department = :department")
    List<Expense> findByDepartment(@Param("department") String department);
    
    @Query("SELECT e FROM Expense e WHERE e.location = :location")
    List<Expense> findByLocation(@Param("location") String location);
    
    boolean existsByReferenceNumber(String referenceNumber);
}