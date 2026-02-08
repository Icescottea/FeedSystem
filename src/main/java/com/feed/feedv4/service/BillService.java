package com.feed.feedv4.service;

import com.feed.feedv4.dto.BillDTO;
import com.feed.feedv4.dto.BillItemDTO;
import com.feed.feedv4.model.Bill;
import com.feed.feedv4.model.BillItem;
import com.feed.feedv4.repository.BillRepository;
import com.feed.feedv4.repository.BillItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BillService {
    
    private final BillRepository billRepository;
    private final BillItemRepository billItemRepository;
    
    public List<BillDTO> getAllBills() {
        return billRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public BillDTO getBillById(Long id) {
        Bill bill = billRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Bill not found with id: " + id));
        return convertToDTO(bill);
    }
    
    public List<BillDTO> getOutstandingBillsByVendor(Long vendorId) {
        return billRepository.findOutstandingBillsByVendorId(vendorId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public BillDTO createBill(BillDTO dto) {
        if (dto.getBillNumber() == null || dto.getBillNumber().isEmpty()) {
            dto.setBillNumber(generateBillNumber());
        }
        
        if (billRepository.existsByBillNumber(dto.getBillNumber())) {
            throw new RuntimeException("Bill number " + dto.getBillNumber() + " already exists");
        }
        
        Bill bill = convertToEntity(dto);
        
        // Auto-calculate due date if not provided
        if (bill.getDueDate() == null && bill.getPaymentTerms() != null) {
            bill.setDueDate(calculateDueDate(bill.getBillDate(), bill.getPaymentTerms()));
        }
        
        calculateTotals(bill);
        
        Bill savedBill = billRepository.save(bill);
        return convertToDTO(savedBill);
    }
    
    public BillDTO updateBill(Long id, BillDTO dto) {
        Bill existingBill = billRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Bill not found with id: " + id));
        
        updateBillFields(existingBill, dto);
        calculateTotals(existingBill);
        
        Bill updatedBill = billRepository.save(existingBill);
        return convertToDTO(updatedBill);
    }
    
    public void deleteBill(Long id) {
        Bill bill = billRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Bill not found with id: " + id));
        
        if (bill.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("Cannot delete bill with payments. Please void the bill instead.");
        }
        
        billRepository.delete(bill);
    }
    
    public BillDTO voidBill(Long id) {
        Bill bill = billRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Bill not found with id: " + id));
        
        if (bill.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("Cannot void bill with payments. Please reverse payments first.");
        }
        
        bill.voidBill();
        Bill voidedBill = billRepository.save(bill);
        
        return convertToDTO(voidedBill);
    }
    
    public BillDTO cloneBill(Long id) {
        Bill original = billRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Bill not found with id: " + id));
        
        Bill cloned = Bill.builder()
            .billNumber(generateBillNumber())
            .vendorId(original.getVendorId())
            .billDate(LocalDate.now())
            .paymentTerms(original.getPaymentTerms())
            .accountsPayable(original.getAccountsPayable())
            .subject(original.getSubject())
            .taxInclusive(original.getTaxInclusive())
            .discount(original.getDiscount())
            .discountType(original.getDiscountType())
            .notes(original.getNotes())
            .status(Bill.BillStatus.DRAFT)
            .build();
        
        cloned.setDueDate(calculateDueDate(cloned.getBillDate(), cloned.getPaymentTerms()));
        
        for (BillItem item : original.getItems()) {
            BillItem clonedItem = BillItem.builder()
                .itemDetails(item.getItemDetails())
                .account(item.getAccount())
                .quantity(item.getQuantity())
                .rate(item.getRate())
                .taxRate(item.getTaxRate())
                .customerDetails(item.getCustomerDetails())
                .amount(item.getAmount())
                .sequence(item.getSequence())
                .build();
            cloned.addItem(clonedItem);
        }
        
        calculateTotals(cloned);
        Bill savedBill = billRepository.save(cloned);
        
        return convertToDTO(savedBill);
    }
    
    public BillDTO recordPayment(Long billId, BigDecimal amount) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Bill not found with id: " + billId));
        
        if (amount.compareTo(bill.getBalanceDue()) > 0) {
            throw new RuntimeException("Payment amount cannot exceed balance due");
        }
        
        bill.recordPayment(amount);
        Bill updatedBill = billRepository.save(bill);
        
        return convertToDTO(updatedBill);
    }
    
    public BillDTO reversePayment(Long billId, BigDecimal amount) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Bill not found with id: " + billId));
        
        bill.reversePayment(amount);
        Bill updatedBill = billRepository.save(bill);
        
        return convertToDTO(updatedBill);
    }
    
    public List<BillDTO> getOverdueBills() {
        return billRepository.findOverdueBills(LocalDate.now()).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<BillDTO> searchBills(String query) {
        return billRepository.searchBills(query).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    private LocalDate calculateDueDate(LocalDate billDate, Bill.PaymentTerms terms) {
        if (terms == null) return billDate;
        
        switch (terms) {
            case DUE_ON_RECEIPT: return billDate;
            case NET_15: return billDate.plusDays(15);
            case NET_30: return billDate.plusDays(30);
            case NET_45: return billDate.plusDays(45);
            case NET_60: return billDate.plusDays(60);
            case NET_90: return billDate.plusDays(90);
            default: return billDate.plusDays(30);
        }
    }
    
    private void calculateTotals(Bill bill) {
        BigDecimal subtotal = bill.getItems().stream()
            .map(item -> {
                item.calculateAmount();
                return item.getAmount();
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        bill.setSubtotal(subtotal);
        
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (bill.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            if (bill.getDiscountType() == Bill.DiscountType.PERCENTAGE) {
                discountAmount = subtotal.multiply(bill.getDiscount()).divide(new BigDecimal("100"));
            } else {
                discountAmount = bill.getDiscount();
            }
        }
        
        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        
        BigDecimal taxAmount = BigDecimal.ZERO;
        if (!bill.getTaxInclusive()) {
            taxAmount = bill.getItems().stream()
                .map(item -> item.getAmount().multiply(item.getTaxRate()).divide(new BigDecimal("100")))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        
        bill.setTax(taxAmount);
        bill.setTotal(afterDiscount.add(taxAmount));
    }
    
    private String generateBillNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        Long count = billRepository.count() + 1;
        return String.format("BILL-%s-%03d", year, count);
    }
    
    private BillDTO convertToDTO(Bill bill) {
        List<BillItemDTO> itemDTOs = bill.getItems().stream()
            .map(this::convertItemToDTO)
            .collect(Collectors.toList());
        
        return BillDTO.builder()
            .id(bill.getId())
            .billNumber(bill.getBillNumber())
            .orderNumber(bill.getOrderNumber())
            .referenceNumber(bill.getReferenceNumber())
            .vendorId(bill.getVendorId())
            .billDate(bill.getBillDate())
            .dueDate(bill.getDueDate())
            .paymentTerms(bill.getPaymentTerms() != null ? bill.getPaymentTerms().name() : null)
            .accountsPayable(bill.getAccountsPayable() != null ? bill.getAccountsPayable().name() : null)
            .subject(bill.getSubject())
            .taxInclusive(bill.getTaxInclusive())
            .subtotal(bill.getSubtotal())
            .discount(bill.getDiscount())
            .discountType(bill.getDiscountType() != null ? bill.getDiscountType().name() : null)
            .tax(bill.getTax())
            .total(bill.getTotal())
            .amountPaid(bill.getAmountPaid())
            .balanceDue(bill.getBalanceDue())
            .status(bill.getStatus() != null ? bill.getStatus().name() : null)
            .notes(bill.getNotes())
            .attachments(bill.getAttachments())
            .items(itemDTOs)
            .createdBy(bill.getCreatedBy())
            .createdAt(bill.getCreatedAt())
            .updatedAt(bill.getUpdatedAt())
            .build();
    }
    
    private BillItemDTO convertItemToDTO(BillItem item) {
        return BillItemDTO.builder()
            .id(item.getId())
            .itemDetails(item.getItemDetails())
            .account(item.getAccount())
            .quantity(item.getQuantity())
            .rate(item.getRate())
            .taxRate(item.getTaxRate())
            .customerDetails(item.getCustomerDetails())
            .amount(item.getAmount())
            .sequence(item.getSequence())
            .build();
    }
    
    private Bill convertToEntity(BillDTO dto) {
        Bill bill = Bill.builder()
            .billNumber(dto.getBillNumber())
            .orderNumber(dto.getOrderNumber())
            .referenceNumber(dto.getReferenceNumber())
            .vendorId(dto.getVendorId())
            .billDate(dto.getBillDate())
            .dueDate(dto.getDueDate())
            .paymentTerms(dto.getPaymentTerms() != null ? Bill.PaymentTerms.valueOf(dto.getPaymentTerms()) : null)
            .accountsPayable(dto.getAccountsPayable() != null ? Bill.AccountsPayable.valueOf(dto.getAccountsPayable()) : null)
            .subject(dto.getSubject())
            .taxInclusive(dto.getTaxInclusive())
            .discount(dto.getDiscount())
            .discountType(dto.getDiscountType() != null ? Bill.DiscountType.valueOf(dto.getDiscountType()) : null)
            .status(dto.getStatus() != null ? Bill.BillStatus.valueOf(dto.getStatus()) : Bill.BillStatus.DRAFT)
            .notes(dto.getNotes())
            .attachments(dto.getAttachments())
            .createdBy(dto.getCreatedBy())
            .build();
        
        if (dto.getItems() != null) {
            for (BillItemDTO itemDTO : dto.getItems()) {
                BillItem item = convertItemToEntity(itemDTO);
                bill.addItem(item);
            }
        }
        
        return bill;
    }
    
    private BillItem convertItemToEntity(BillItemDTO dto) {
        return BillItem.builder()
            .itemDetails(dto.getItemDetails())
            .account(dto.getAccount())
            .quantity(dto.getQuantity())
            .rate(dto.getRate())
            .taxRate(dto.getTaxRate())
            .customerDetails(dto.getCustomerDetails())
            .amount(dto.getAmount())
            .sequence(dto.getSequence())
            .build();
    }
    
    private void updateBillFields(Bill bill, BillDTO dto) {
        bill.setOrderNumber(dto.getOrderNumber());
        bill.setReferenceNumber(dto.getReferenceNumber());
        bill.setVendorId(dto.getVendorId());
        bill.setBillDate(dto.getBillDate());
        bill.setDueDate(dto.getDueDate());
        bill.setPaymentTerms(dto.getPaymentTerms() != null ? Bill.PaymentTerms.valueOf(dto.getPaymentTerms()) : null);
        bill.setAccountsPayable(dto.getAccountsPayable() != null ? Bill.AccountsPayable.valueOf(dto.getAccountsPayable()) : null);
        bill.setSubject(dto.getSubject());
        bill.setTaxInclusive(dto.getTaxInclusive());
        bill.setDiscount(dto.getDiscount());
        bill.setDiscountType(dto.getDiscountType() != null ? Bill.DiscountType.valueOf(dto.getDiscountType()) : null);
        bill.setNotes(dto.getNotes());
        bill.setAttachments(dto.getAttachments());
        
        bill.getItems().clear();
        if (dto.getItems() != null) {
            for (BillItemDTO itemDTO : dto.getItems()) {
                BillItem item = convertItemToEntity(itemDTO);
                bill.addItem(item);
            }
        }
    }
}