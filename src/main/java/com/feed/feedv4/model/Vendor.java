package com.feed.feedv4.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vendors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String vendorDisplayName;
    
    @Column(nullable = false, length = 200)
    private String companyName;
    
    @Column(nullable = false, length = 100)
    private String vendorEmail;
    
    @Column(nullable = false, length = 50)
    private String vendorPhone;
    
    @Column(length = 200)
    private String website;
    
    @Column(nullable = false, length = 10)
    private String currency = "LKR";
    
    @Column(nullable = false, length = 20)
    private String paymentTerms = "30"; // Default 30 days
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private GstTreatment gstTreatment = GstTreatment.REGISTERED;
    
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
    private String billingCountry = "Sri Lanka";
    
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
    private String shippingCountry = "Sri Lanka";
    
    // Custom Fields
    @Column(length = 500)
    private String customField1;
    
    @Column(length = 500)
    private String customField2;
    
    // Reporting Tags
    @Column(length = 100)
    private String department;
    
    @Column(length = 100)
    private String location;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VendorStatus status = VendorStatus.ACTIVE;
    
    // Financial tracking - these are calculated fields
    @Transient
    private BigDecimal payables = BigDecimal.ZERO;
    
    @Transient
    private BigDecimal unusedCredits = BigDecimal.ZERO;
    
    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ContactPerson> contactPersons = new ArrayList<>();
    
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
    
    public enum VendorStatus {
        ACTIVE, INACTIVE
    }
    
    // Helper methods
    public void addContactPerson(ContactPerson contactPerson) {
        contactPersons.add(contactPerson);
        contactPerson.setVendor(this);
    }
    
    public void removeContactPerson(ContactPerson contactPerson) {
        contactPersons.remove(contactPerson);
        contactPerson.setVendor(null);
    }
}