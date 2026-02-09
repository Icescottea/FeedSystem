package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String customerName;
    
    @Column(length = 200)
    private String companyName;
    
    @Column(unique = true, nullable = false, length = 200)
    private String email;
    
    @Column(length = 50)
    private String phone;
    
    @Column(length = 50)
    private String mobile;
    
    @Column(length = 200)
    private String website;
    
    @Column(nullable = false, length = 10)
    private String currency = "LKR";
    
    @Column(nullable = false)
    private Integer paymentTerms = 30;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private GstTreatment gstTreatment;
    
    @Column(length = 50)
    private String gstNumber;
    
    @Column(length = 50)
    private String panNumber;
    
    // Billing Address
    @Column(length = 500)
    private String billingStreet;
    
    @Column(length = 100)
    private String billingCity;
    
    @Column(length = 100)
    private String billingState;
    
    @Column(length = 20)
    private String billingZip;
    
    @Column(length = 100)
    private String billingCountry;
    
    // Shipping Address
    @Column(length = 500)
    private String shippingStreet;
    
    @Column(length = 100)
    private String shippingCity;
    
    @Column(length = 100)
    private String shippingState;
    
    @Column(length = 20)
    private String shippingZip;
    
    @Column(length = 100)
    private String shippingCountry;
    
    @Column(length = 200)
    private String customField1;
    
    @Column(length = 200)
    private String customField2;
    
    @Column(length = 100)
    private String department;
    
    @Column(length = 100)
    private String location;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CustomerStatus status = CustomerStatus.ACTIVE;
    
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CustomerContactPerson> contactPersons = new ArrayList<>();
    
    @Transient
    private BigDecimal receivables = BigDecimal.ZERO;
    
    @Transient
    private BigDecimal unusedCredits = BigDecimal.ZERO;
    
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
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum GstTreatment {
        REGISTERED, UNREGISTERED, EXEMPT
    }
    
    public enum CustomerStatus {
        ACTIVE, INACTIVE
    }
    
    public void addContactPerson(CustomerContactPerson contactPerson) {
        contactPersons.add(contactPerson);
        contactPerson.setCustomer(this);
    }
    
    public void removeContactPerson(CustomerContactPerson contactPerson) {
        contactPersons.remove(contactPerson);
        contactPerson.setCustomer(null);
    }
}