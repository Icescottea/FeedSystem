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
public class CustomerDTO {
    
    private Long id;
    private String customerName;
    private String companyName;
    private String email;
    private String phone;
    private String mobile;
    private String website;
    private String currency;
    private Integer paymentTerms;
    private String gstTreatment;
    private String gstNumber;
    private String panNumber;
    private String billingStreet;
    private String billingCity;
    private String billingState;
    private String billingZip;
    private String billingCountry;
    private String shippingStreet;
    private String shippingCity;
    private String shippingState;
    private String shippingZip;
    private String shippingCountry;
    private String customField1;
    private String customField2;
    private String department;
    private String location;
    private String notes;
    private String status;
    private BigDecimal receivables;
    private BigDecimal unusedCredits;
    private List<CustomerContactPersonDTO> contactPersons;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}