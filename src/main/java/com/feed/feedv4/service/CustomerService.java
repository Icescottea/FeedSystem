package com.feed.feedv4.service;

import com.feed.feedv4.dto.CustomerDTO;
import com.feed.feedv4.dto.CustomerContactPersonDTO;
import com.feed.feedv4.model.Customer;
import com.feed.feedv4.model.CustomerContactPerson;
import com.feed.feedv4.repository.CustomerRepository;
import com.feed.feedv4.repository.CustomerContactPersonRepository;
import com.feed.feedv4.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    private final CustomerContactPersonRepository contactPersonRepository;
    private final InvoiceRepository invoiceRepository;
    
    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<CustomerDTO> getAllActiveCustomers() {
        return customerRepository.findAllActive().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public CustomerDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        return convertToDTO(customer);
    }
    
    public CustomerDTO getCustomerWithFinancials(Long id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        
        CustomerDTO dto = convertToDTO(customer);
        
        // Calculate receivables from outstanding invoices
        dto.setReceivables(calculateReceivables(id));
        
        // Calculate unused credits (if you have advance payments system)
        dto.setUnusedCredits(BigDecimal.ZERO); // TODO: Implement when payment system is ready
        
        return dto;
    }
    
    public CustomerDTO createCustomer(CustomerDTO customerDTO) {
        // Validate unique email
        if (customerRepository.existsByEmail(customerDTO.getEmail())) {
            throw new RuntimeException("Customer with email " + customerDTO.getEmail() + " already exists");
        }
        
        // Validate unique GST number if provided
        if (customerDTO.getGstNumber() != null && 
            !customerDTO.getGstNumber().isEmpty() &&
            customerRepository.existsByGstNumber(customerDTO.getGstNumber())) {
            throw new RuntimeException("Customer with GST number " + customerDTO.getGstNumber() + " already exists");
        }
        
        Customer customer = convertToEntity(customerDTO);
        Customer savedCustomer = customerRepository.save(customer);
        
        return convertToDTO(savedCustomer);
    }
    
    public CustomerDTO updateCustomer(Long id, CustomerDTO customerDTO) {
        Customer existingCustomer = customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        
        // Validate unique email (exclude current customer)
        if (!existingCustomer.getEmail().equals(customerDTO.getEmail()) &&
            customerRepository.existsByEmail(customerDTO.getEmail())) {
            throw new RuntimeException("Customer with email " + customerDTO.getEmail() + " already exists");
        }
        
        updateCustomerFields(existingCustomer, customerDTO);
        
        Customer updatedCustomer = customerRepository.save(existingCustomer);
        return convertToDTO(updatedCustomer);
    }
    
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        
        // Check if customer has outstanding receivables
        BigDecimal receivables = calculateReceivables(id);
        if (receivables.compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("Cannot delete customer with outstanding receivables. Please clear all invoices first.");
        }
        
        // Check if customer has any invoices
        if (invoiceRepository.existsByCustomerId(id)) {
            throw new RuntimeException("Cannot delete customer with existing invoices. Please mark customer as inactive instead.");
        }
        
        customerRepository.delete(customer);
    }
    
    public CustomerDTO markCustomerInactive(Long id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        
        customer.setStatus(Customer.CustomerStatus.INACTIVE);
        Customer updatedCustomer = customerRepository.save(customer);
        
        return convertToDTO(updatedCustomer);
    }
    
    public CustomerDTO markCustomerActive(Long id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        
        customer.setStatus(Customer.CustomerStatus.ACTIVE);
        Customer updatedCustomer = customerRepository.save(customer);
        
        return convertToDTO(updatedCustomer);
    }
    
    public List<CustomerDTO> searchCustomers(String query) {
        return customerRepository.searchCustomers(query).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    private BigDecimal calculateReceivables(Long customerId) {
        // Sum all outstanding invoices for this customer
        // sumOutstandingByCustomerId returns null when no invoices exist — coerce to ZERO
        BigDecimal result = invoiceRepository.sumOutstandingByCustomerId(customerId);
        return result != null ? result : BigDecimal.ZERO;
    }
    
    private CustomerDTO convertToDTO(Customer customer) {
        List<CustomerContactPersonDTO> contactPersonDTOs = customer.getContactPersons().stream()
            .map(this::convertContactPersonToDTO)
            .collect(Collectors.toList());
        
        return CustomerDTO.builder()
            .id(customer.getId())
            .customerName(customer.getCustomerName())
            .companyName(customer.getCompanyName())
            .email(customer.getEmail())
            .phone(customer.getPhone())
            .mobile(customer.getMobile())
            .website(customer.getWebsite())
            .currency(customer.getCurrency())
            .paymentTerms(customer.getPaymentTerms())
            .gstTreatment(customer.getGstTreatment() != null ? customer.getGstTreatment().name() : null)
            .gstNumber(customer.getGstNumber())
            .panNumber(customer.getPanNumber())
            .billingStreet(customer.getBillingStreet())
            .billingCity(customer.getBillingCity())
            .billingState(customer.getBillingState())
            .billingZip(customer.getBillingZip())
            .billingCountry(customer.getBillingCountry())
            .shippingStreet(customer.getShippingStreet())
            .shippingCity(customer.getShippingCity())
            .shippingState(customer.getShippingState())
            .shippingZip(customer.getShippingZip())
            .shippingCountry(customer.getShippingCountry())
            .customField1(customer.getCustomField1())
            .customField2(customer.getCustomField2())
            .department(customer.getDepartment())
            .location(customer.getLocation())
            .notes(customer.getNotes())
            .status(customer.getStatus() != null ? customer.getStatus().name() : null)
            .receivables(customer.getReceivables())
            .unusedCredits(customer.getUnusedCredits())
            .contactPersons(contactPersonDTOs)
            .createdBy(customer.getCreatedBy())
            .createdAt(customer.getCreatedAt())
            .updatedAt(customer.getUpdatedAt())
            .build();
    }
    
    private CustomerContactPersonDTO convertContactPersonToDTO(CustomerContactPerson contactPerson) {
        return CustomerContactPersonDTO.builder()
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
    
    private Customer convertToEntity(CustomerDTO dto) {
        Customer customer = Customer.builder()
            .customerName(dto.getCustomerName())
            .companyName(dto.getCompanyName())
            .email(dto.getEmail())
            .phone(dto.getPhone())
            .mobile(dto.getMobile())
            .website(dto.getWebsite())
            .currency(dto.getCurrency())
            .paymentTerms(dto.getPaymentTerms())
            .gstTreatment(dto.getGstTreatment() != null ? Customer.GstTreatment.valueOf(dto.getGstTreatment()) : null)
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
            .status(dto.getStatus() != null ? Customer.CustomerStatus.valueOf(dto.getStatus()) : Customer.CustomerStatus.ACTIVE)
            .createdBy(dto.getCreatedBy())
            .build();
        
        // Add contact persons
        if (dto.getContactPersons() != null) {
            for (CustomerContactPersonDTO cpDTO : dto.getContactPersons()) {
                CustomerContactPerson cp = convertContactPersonToEntity(cpDTO);
                customer.addContactPerson(cp);
            }
        }
        
        return customer;
    }
    
    private CustomerContactPerson convertContactPersonToEntity(CustomerContactPersonDTO dto) {
        return CustomerContactPerson.builder()
            .firstName(dto.getFirstName())
            .lastName(dto.getLastName())
            .email(dto.getEmail())
            .phone(dto.getPhone())
            .mobile(dto.getMobile())
            .designation(dto.getDesignation())
            .sequence(dto.getSequence())
            .build();
    }
    
    private void updateCustomerFields(Customer customer, CustomerDTO dto) {
        customer.setCustomerName(dto.getCustomerName());
        customer.setCompanyName(dto.getCompanyName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setMobile(dto.getMobile());
        customer.setWebsite(dto.getWebsite());
        customer.setCurrency(dto.getCurrency());
        customer.setPaymentTerms(dto.getPaymentTerms());
        customer.setGstTreatment(dto.getGstTreatment() != null ? Customer.GstTreatment.valueOf(dto.getGstTreatment()) : null);
        customer.setGstNumber(dto.getGstNumber());
        customer.setPanNumber(dto.getPanNumber());
        customer.setBillingStreet(dto.getBillingStreet());
        customer.setBillingCity(dto.getBillingCity());
        customer.setBillingState(dto.getBillingState());
        customer.setBillingZip(dto.getBillingZip());
        customer.setBillingCountry(dto.getBillingCountry());
        customer.setShippingStreet(dto.getShippingStreet());
        customer.setShippingCity(dto.getShippingCity());
        customer.setShippingState(dto.getShippingState());
        customer.setShippingZip(dto.getShippingZip());
        customer.setShippingCountry(dto.getShippingCountry());
        customer.setCustomField1(dto.getCustomField1());
        customer.setCustomField2(dto.getCustomField2());
        customer.setDepartment(dto.getDepartment());
        customer.setLocation(dto.getLocation());
        customer.setNotes(dto.getNotes());
        customer.setStatus(dto.getStatus() != null ? Customer.CustomerStatus.valueOf(dto.getStatus()) : Customer.CustomerStatus.ACTIVE);
        
        // Update contact persons
        customer.getContactPersons().clear();
        if (dto.getContactPersons() != null) {
            for (CustomerContactPersonDTO cpDTO : dto.getContactPersons()) {
                CustomerContactPerson cp = convertContactPersonToEntity(cpDTO);
                customer.addContactPerson(cp);
            }
        }
    }
}