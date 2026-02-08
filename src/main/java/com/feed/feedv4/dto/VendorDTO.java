package com.feed.feedv4.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorDTO {
    
    private Long id;
    private String vendorDisplayName;
    private String companyName;
    private String vendorEmail;
    private String vendorPhone;
    private String website;
    private String currency;
    private String paymentTerms;
    private String gstTreatment;
    private String gstNumber;
    private String panNumber;
    
    // Billing Address
    private String billingStreet;
    private String billingCity;
    private String billingState;
    private String billingZip;
    private String billingCountry;
    
    // Shipping Address
    private String shippingStreet;
    private String shippingCity;
    private String shippingState;
    private String shippingZip;
    private String shippingCountry;
    
    // Custom Fields
    private String customField1;
    private String customField2;
    
    // Reporting Tags
    private String department;
    private String location;
    
    private String notes;
    private String status;
    
    // Financial (calculated)
    private BigDecimal payables;
    private BigDecimal unusedCredits;
    
    private List<ContactPersonDTO> contactPersons;
    
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}