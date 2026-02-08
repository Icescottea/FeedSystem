package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(nullable = false, length = 200)
    private String expenseAccount;
    
    @Column(unique = true, length = 50)
    private String referenceNumber;
    
    @Column
    private Long vendorId;
    
    @Column(length = 200)
    private String vendorName;
    
    @Column(nullable = false, length = 200)
    private String paidThrough;
    
    @Column
    private Long customerId;
    
    @Column(length = 200)
    private String customerName;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amount = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private Boolean taxInclusive = false;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal tax = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal netAmount = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExpenseStatus status = ExpenseStatus.PAID;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    // Reporting Tags
    @Column(length = 100)
    private String department;
    
    @Column(length = 100)
    private String location;
    
    @Column(length = 500)
    private String attachments; // JSON array of file names
    
    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExpenseAccountingEntry> accountingEntries = new ArrayList<>();
    
    @Column(length = 100)
    private String createdBy;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        calculateNetAmount();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateNetAmount();
    }
    
    public enum ExpenseStatus {
        PAID, UNPAID, PARTIALLY_PAID
    }
    
    // Helper methods
    public void addAccountingEntry(ExpenseAccountingEntry entry) {
        accountingEntries.add(entry);
        entry.setExpense(this);
    }
    
    public void removeAccountingEntry(ExpenseAccountingEntry entry) {
        accountingEntries.remove(entry);
        entry.setExpense(null);
    }
    
    public void calculateNetAmount() {
        if (taxInclusive) {
            this.netAmount = this.amount;
        } else {
            this.netAmount = this.amount.add(this.tax);
        }
    }
}