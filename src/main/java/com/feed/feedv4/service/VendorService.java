package com.feed.feedv4.service;

import com.feed.feedv4.dto.VendorDTO;
import com.feed.feedv4.dto.ContactPersonDTO;
import com.feed.feedv4.model.Vendor;
import com.feed.feedv4.model.ContactPerson;
import com.feed.feedv4.repository.VendorRepository;
import com.feed.feedv4.repository.ContactPersonRepository;
import com.feed.feedv4.repository.BillRepository;
import com.feed.feedv4.repository.PurchaseOrderRepository;
import com.feed.feedv4.repository.PaymentMadeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorService {
    
    private final VendorRepository vendorRepository;
    private final ContactPersonRepository contactPersonRepository;
    private final BillRepository billRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PaymentMadeRepository paymentMadeRepository;
    
    public List<VendorDTO> getAllVendors() {
        return vendorRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<VendorDTO> getAllActiveVendors() {
        return vendorRepository.findAllActive().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public VendorDTO getVendorById(Long id) {
        Vendor vendor = vendorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + id));
        return convertToDTO(vendor);
    }
    
    public VendorDTO getVendorWithFinancials(Long id) {
        Vendor vendor = vendorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + id));
        
        VendorDTO dto = convertToDTO(vendor);
        
        // Calculate payables from outstanding bills
        dto.setPayables(calculatePayables(id));
        
        // Calculate unused credits from excess payments
        dto.setUnusedCredits(calculateUnusedCredits(id));
        
        return dto;
    }
    
    public VendorDTO createVendor(VendorDTO vendorDTO) {
        // Validate unique email
        if (vendorRepository.existsByVendorEmail(vendorDTO.getVendorEmail())) {
            throw new RuntimeException("Vendor with email " + vendorDTO.getVendorEmail() + " already exists");
        }
        
        // Validate unique GST number if provided
        if (vendorDTO.getGstNumber() != null && 
            !vendorDTO.getGstNumber().isEmpty() &&
            vendorRepository.existsByGstNumber(vendorDTO.getGstNumber())) {
            throw new RuntimeException("Vendor with GST number " + vendorDTO.getGstNumber() + " already exists");
        }
        
        Vendor vendor = convertToEntity(vendorDTO);
        Vendor savedVendor = vendorRepository.save(vendor);
        
        return convertToDTO(savedVendor);
    }
    
    public VendorDTO updateVendor(Long id, VendorDTO vendorDTO) {
        Vendor existingVendor = vendorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + id));
        
        // Validate unique email (exclude current vendor)
        if (!existingVendor.getVendorEmail().equals(vendorDTO.getVendorEmail()) &&
            vendorRepository.existsByVendorEmail(vendorDTO.getVendorEmail())) {
            throw new RuntimeException("Vendor with email " + vendorDTO.getVendorEmail() + " already exists");
        }
        
        // Update fields
        updateVendorFields(existingVendor, vendorDTO);
        
        Vendor updatedVendor = vendorRepository.save(existingVendor);
        return convertToDTO(updatedVendor);
    }
    
    public void deleteVendor(Long id) {
        Vendor vendor = vendorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + id));
        
        // Check if vendor has outstanding payables
        BigDecimal payables = calculatePayables(id);
        if (payables.compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("Cannot delete vendor with outstanding payables. Please clear all bills first.");
        }
        
        // Check if vendor has any bills
        if (!billRepository.findByVendorId(id).isEmpty()) {
            throw new RuntimeException("Cannot delete vendor with existing bills. Please mark vendor as inactive instead.");
        }
        
        // Check if vendor has any purchase orders
        if (!purchaseOrderRepository.findByVendorId(id).isEmpty()) {
            throw new RuntimeException("Cannot delete vendor with existing purchase orders. Please mark vendor as inactive instead.");
        }
        
        vendorRepository.delete(vendor);
    }
    
    public VendorDTO markVendorInactive(Long id) {
        Vendor vendor = vendorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + id));
        
        vendor.setStatus(Vendor.VendorStatus.INACTIVE);
        Vendor updatedVendor = vendorRepository.save(vendor);
        
        return convertToDTO(updatedVendor);
    }
    
    public VendorDTO markVendorActive(Long id) {
        Vendor vendor = vendorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + id));
        
        vendor.setStatus(Vendor.VendorStatus.ACTIVE);
        Vendor updatedVendor = vendorRepository.save(vendor);
        
        return convertToDTO(updatedVendor);
    }
    
    public List<VendorDTO> searchVendors(String query) {
        return vendorRepository.searchVendors(query).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    private BigDecimal calculatePayables(Long vendorId) {
        // Sum all outstanding bills for this vendor
        return billRepository.sumOutstandingByVendorId(vendorId);
    }
    
    private BigDecimal calculateUnusedCredits(Long vendorId) {
        // Sum all excess payments for this vendor
        return paymentMadeRepository.sumExcessByVendorId(vendorId);
    }
    
    private VendorDTO convertToDTO(Vendor vendor) {
        List<ContactPersonDTO> contactPersonDTOs = vendor.getContactPersons().stream()
            .map(this::convertContactPersonToDTO)
            .collect(Collectors.toList());
        
        return VendorDTO.builder()
            .id(vendor.getId())
            .vendorDisplayName(vendor.getVendorDisplayName())
            .companyName(vendor.getCompanyName())
            .vendorEmail(vendor.getVendorEmail())
            .vendorPhone(vendor.getVendorPhone())
            .website(vendor.getWebsite())
            .currency(vendor.getCurrency())
            .paymentTerms(vendor.getPaymentTerms())
            .gstTreatment(vendor.getGstTreatment() != null ? vendor.getGstTreatment().name() : null)
            .gstNumber(vendor.getGstNumber())
            .panNumber(vendor.getPanNumber())
            .billingStreet(vendor.getBillingStreet())
            .billingCity(vendor.getBillingCity())
            .billingState(vendor.getBillingState())
            .billingZip(vendor.getBillingZip())
            .billingCountry(vendor.getBillingCountry())
            .shippingStreet(vendor.getShippingStreet())
            .shippingCity(vendor.getShippingCity())
            .shippingState(vendor.getShippingState())
            .shippingZip(vendor.getShippingZip())
            .shippingCountry(vendor.getShippingCountry())
            .customField1(vendor.getCustomField1())
            .customField2(vendor.getCustomField2())
            .department(vendor.getDepartment())
            .location(vendor.getLocation())
            .notes(vendor.getNotes())
            .status(vendor.getStatus() != null ? vendor.getStatus().name() : null)
            .payables(vendor.getPayables())
            .unusedCredits(vendor.getUnusedCredits())
            .contactPersons(contactPersonDTOs)
            .createdBy(vendor.getCreatedBy())
            .createdAt(vendor.getCreatedAt())
            .updatedAt(vendor.getUpdatedAt())
            .build();
    }
    
    private ContactPersonDTO convertContactPersonToDTO(ContactPerson contactPerson) {
        return ContactPersonDTO.builder()
            .id(contactPerson.getId())
            .firstName(contactPerson.getFirstName())
            .lastName(contactPerson.getLastName())
            .email(contactPerson.getEmail())
            .phone(contactPerson.getPhone())
            .mobile(contactPerson.getMobile())
            .designation(contactPerson.getDesignation())
            .sequence(contactPerson.getSequence())
            .build();
    }
    
    private Vendor convertToEntity(VendorDTO dto) {
        Vendor vendor = Vendor.builder()
            .vendorDisplayName(dto.getVendorDisplayName())
            .companyName(dto.getCompanyName())
            .vendorEmail(dto.getVendorEmail())
            .vendorPhone(dto.getVendorPhone())
            .website(dto.getWebsite())
            .currency(dto.getCurrency())
            .paymentTerms(dto.getPaymentTerms())
            .gstTreatment(dto.getGstTreatment() != null ? Vendor.GstTreatment.valueOf(dto.getGstTreatment()) : null)
            .gstNumber(dto.getGstNumber())
            .panNumber(dto.getPanNumber())
            .billingStreet(dto.getBillingStreet())
            .billingCity(dto.getBillingCity())
            .billingState(dto.getBillingState())
            .billingZip(dto.getBillingZip())
            .billingCountry(dto.getBillingCountry())
            .shippingStreet(dto.getShippingStreet())
            .shippingCity(dto.getShippingCity())
            .shippingState(dto.getShippingState())
            .shippingZip(dto.getShippingZip())
            .shippingCountry(dto.getShippingCountry())
            .customField1(dto.getCustomField1())
            .customField2(dto.getCustomField2())
            .department(dto.getDepartment())
            .location(dto.getLocation())
            .notes(dto.getNotes())
            .status(dto.getStatus() != null ? Vendor.VendorStatus.valueOf(dto.getStatus()) : Vendor.VendorStatus.ACTIVE)
            .createdBy(dto.getCreatedBy())
            .build();
        
        // Add contact persons
        if (dto.getContactPersons() != null) {
            for (ContactPersonDTO cpDTO : dto.getContactPersons()) {
                ContactPerson cp = convertContactPersonToEntity(cpDTO);
                vendor.addContactPerson(cp);
            }
        }
        
        return vendor;
    }
    
    private ContactPerson convertContactPersonToEntity(ContactPersonDTO dto) {
        return ContactPerson.builder()
            .firstName(dto.getFirstName())
            .lastName(dto.getLastName())
            .email(dto.getEmail())
            .phone(dto.getPhone())
            .mobile(dto.getMobile())
            .designation(dto.getDesignation())
            .sequence(dto.getSequence())
            .build();
    }
    
    private void updateVendorFields(Vendor vendor, VendorDTO dto) {
        vendor.setVendorDisplayName(dto.getVendorDisplayName());
        vendor.setCompanyName(dto.getCompanyName());
        vendor.setVendorEmail(dto.getVendorEmail());
        vendor.setVendorPhone(dto.getVendorPhone());
        vendor.setWebsite(dto.getWebsite());
        vendor.setCurrency(dto.getCurrency());
        vendor.setPaymentTerms(dto.getPaymentTerms());
        vendor.setGstTreatment(dto.getGstTreatment() != null ? Vendor.GstTreatment.valueOf(dto.getGstTreatment()) : null);
        vendor.setGstNumber(dto.getGstNumber());
        vendor.setPanNumber(dto.getPanNumber());
        vendor.setBillingStreet(dto.getBillingStreet());
        vendor.setBillingCity(dto.getBillingCity());
        vendor.setBillingState(dto.getBillingState());
        vendor.setBillingZip(dto.getBillingZip());
        vendor.setBillingCountry(dto.getBillingCountry());
        vendor.setShippingStreet(dto.getShippingStreet());
        vendor.setShippingCity(dto.getShippingCity());
        vendor.setShippingState(dto.getShippingState());
        vendor.setShippingZip(dto.getShippingZip());
        vendor.setShippingCountry(dto.getShippingCountry());
        vendor.setCustomField1(dto.getCustomField1());
        vendor.setCustomField2(dto.getCustomField2());
        vendor.setDepartment(dto.getDepartment());
        vendor.setLocation(dto.getLocation());
        vendor.setNotes(dto.getNotes());
        
        // Update contact persons
        vendor.getContactPersons().clear();
        if (dto.getContactPersons() != null) {
            for (ContactPersonDTO cpDTO : dto.getContactPersons()) {
                ContactPerson cp = convertContactPersonToEntity(cpDTO);
                vendor.addContactPerson(cp);
            }
        }
    }
}