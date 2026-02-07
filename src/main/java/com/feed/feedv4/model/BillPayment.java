package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bill_payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillPayment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_made_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private PaymentMade paymentMade;
    
    @Column(nullable = false)
    private Long billId;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal paymentAmount = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private LocalDate paymentDate;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}