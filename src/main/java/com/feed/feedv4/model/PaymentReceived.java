package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payments_received")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentReceived {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String paymentNumber;
    
    @Column(length = 100)
    private String referenceNumber;
    
    @Column(nullable = false)
    private Long customerId;
    
    @Column(nullable = false)
    private LocalDate paymentDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentMode paymentMode = PaymentMode.BANK_TRANSFER;
    
    @Column(nullable = false, length = 200)
    private String depositTo; // Account where payment is deposited
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amountReceived = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal bankCharges = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private Boolean taxDeducted = false;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal taxAmount = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amountUsed = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal unusedAmount = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.COMPLETED;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentType type = PaymentType.INVOICE_PAYMENT;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(length = 500)
    private String attachments; // JSON array of file names
    
    @OneToMany(mappedBy = "paymentReceived", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InvoicePayment> invoicePayments = new ArrayList<>();
    
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
        calculateAmounts();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateAmounts();
    }
    
    public enum PaymentMode {
        CASH, BANK_TRANSFER, CHEQUE, CREDIT_CARD, DEBIT_CARD, ONLINE_PAYMENT
    }
    
    public enum PaymentStatus {
        COMPLETED, PARTIALLY_USED, VOID
    }
    
    public enum PaymentType {
        INVOICE_PAYMENT, PARTIAL_PAYMENT, ADVANCE_PAYMENT
    }
    
    // Helper methods
    public void addInvoicePayment(InvoicePayment invoicePayment) {
        invoicePayments.add(invoicePayment);
        invoicePayment.setPaymentReceived(this);
    }
    
    public void removeInvoicePayment(InvoicePayment invoicePayment) {
        invoicePayments.remove(invoicePayment);
        invoicePayment.setPaymentReceived(null);
    }
    
    public void calculateAmounts() {
        // Calculate amount used (sum of all invoice payments)
        this.amountUsed = invoicePayments.stream()
            .map(InvoicePayment::getPaymentAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate unused amount
        BigDecimal netReceived = this.amountReceived.subtract(this.bankCharges).subtract(this.taxAmount);
        this.unusedAmount = netReceived.subtract(this.amountUsed);
        
        // Ensure no negative values
        if (this.unusedAmount.compareTo(BigDecimal.ZERO) < 0) {
            this.unusedAmount = BigDecimal.ZERO;
        }
        
        // Update status
        if (this.status != PaymentStatus.VOID) {
            if (this.unusedAmount.compareTo(BigDecimal.ZERO) > 0) {
                this.status = PaymentStatus.PARTIALLY_USED;
            } else {
                this.status = PaymentStatus.COMPLETED;
            }
        }
        
        // Determine payment type
        if (invoicePayments.isEmpty()) {
            this.type = PaymentType.ADVANCE_PAYMENT;
        } else {
            // Check if any invoice is partially paid
            boolean hasPartialPayment = invoicePayments.stream()
                .anyMatch(ip -> ip.getPaymentAmount().compareTo(ip.getInvoiceBalanceDue()) < 0);
            
            if (hasPartialPayment) {
                this.type = PaymentType.PARTIAL_PAYMENT;
            } else {
                this.type = PaymentType.INVOICE_PAYMENT;
            }
        }
    }
    
    public void voidPayment() {
        this.status = PaymentStatus.VOID;
    }
}