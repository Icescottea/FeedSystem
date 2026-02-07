package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payments_made")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMade {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String paymentNumber;
    
    @Column(length = 100)
    private String referenceNumber;
    
    @Column(length = 100)
    private String orderNumber;
    
    @Column(nullable = false)
    private Long vendorId;
    
    @Column(nullable = false)
    private LocalDate paymentDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMode paymentMode = PaymentMode.BANK_TRANSFER;
    
    @Column(nullable = false)
    private Long paidThroughAccountId;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal paymentMade = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal bankCharges = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amountPaid = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amountUsed = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amountRefunded = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amountInExcess = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.DRAFT;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(length = 500)
    private String attachments; // JSON array of file names
    
    @Column(length = 100)
    private String createdBy;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "paymentMade", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BillPayment> billPayments = new ArrayList<>();
    
    @OneToMany(mappedBy = "paymentMade", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AccountingEntry> accountingEntries = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        calculateAmounts();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateAmounts();
    }
    
    public enum PaymentMode {
        BANK_TRANSFER, CHEQUE, CASH, ONLINE_PAYMENT, CREDIT_CARD
    }
    
    public enum PaymentStatus {
        DRAFT, PAID, VOID
    }
    
    // Helper methods
    public void addBillPayment(BillPayment billPayment) {
        billPayments.add(billPayment);
        billPayment.setPaymentMade(this);
    }
    
    public void removeBillPayment(BillPayment billPayment) {
        billPayments.remove(billPayment);
        billPayment.setPaymentMade(null);
    }
    
    public void addAccountingEntry(AccountingEntry entry) {
        accountingEntries.add(entry);
        entry.setPaymentMade(this);
    }
    
    public void removeAccountingEntry(AccountingEntry entry) {
        accountingEntries.remove(entry);
        entry.setPaymentMade(null);
    }
    
    public void calculateAmounts() {
        // Calculate amount paid (sum of all bill payments)
        this.amountPaid = billPayments.stream()
            .map(BillPayment::getPaymentAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Amount used equals amount paid (allocated to bills)
        this.amountUsed = this.amountPaid;
        
        // Amount in excess is the difference between payment made and amount used
        this.amountInExcess = this.paymentMade.subtract(this.amountUsed).subtract(this.bankCharges);
        
        // Ensure no negative values
        if (this.amountInExcess.compareTo(BigDecimal.ZERO) < 0) {
            this.amountInExcess = BigDecimal.ZERO;
        }
    }
    
    public void voidPayment() {
        this.status = PaymentStatus.VOID;
    }
}