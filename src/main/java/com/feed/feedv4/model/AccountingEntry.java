package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "accounting_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountingEntry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_made_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private PaymentMade paymentMade;
    
    @Column(nullable = false, length = 200)
    private String accountName;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal debit = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal credit = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private Integer sequence = 0;
}