package com.feed.feedv4.service;

import com.feed.feedv4.dto.PurchaseOrderDTO;
import com.feed.feedv4.dto.PurchaseOrderItemDTO;
import com.feed.feedv4.model.PurchaseOrder;
import com.feed.feedv4.model.PurchaseOrderItem;
import com.feed.feedv4.repository.PurchaseOrderRepository;
import com.feed.feedv4.repository.PurchaseOrderItemRepository;
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
public class PurchaseOrderService {
    
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    
    public List<PurchaseOrderDTO> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public PurchaseOrderDTO getPurchaseOrderById(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Purchase Order not found with id: " + id));
        return convertToDTO(po);
    }
    
    public PurchaseOrderDTO createPurchaseOrder(PurchaseOrderDTO dto) {
        // Auto-generate PO number if not provided
        if (dto.getPurchaseOrderNumber() == null || dto.getPurchaseOrderNumber().isEmpty()) {
            dto.setPurchaseOrderNumber(generatePurchaseOrderNumber());
        }
        
        // Validate unique PO number
        if (purchaseOrderRepository.existsByPurchaseOrderNumber(dto.getPurchaseOrderNumber())) {
            throw new RuntimeException("Purchase Order number " + dto.getPurchaseOrderNumber() + " already exists");
        }
        
        PurchaseOrder po = convertToEntity(dto);
        calculateTotals(po);
        
        PurchaseOrder savedPO = purchaseOrderRepository.save(po);
        return convertToDTO(savedPO);
    }
    
    public PurchaseOrderDTO updatePurchaseOrder(Long id, PurchaseOrderDTO dto) {
        PurchaseOrder existingPO = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Purchase Order not found with id: " + id));
        
        updatePurchaseOrderFields(existingPO, dto);
        calculateTotals(existingPO);
        
        PurchaseOrder updatedPO = purchaseOrderRepository.save(existingPO);
        return convertToDTO(updatedPO);
    }
    
    public void deletePurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Purchase Order not found with id: " + id));
        
        // Cannot delete if already billed
        if (po.getBilledStatus() != PurchaseOrder.BilledStatus.NOT_BILLED) {
            throw new RuntimeException("Cannot delete Purchase Order that has been billed");
        }
        
        purchaseOrderRepository.delete(po);
    }
    
    public PurchaseOrderDTO clonePurchaseOrder(Long id) {
        PurchaseOrder original = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Purchase Order not found with id: " + id));
        
        PurchaseOrder cloned = PurchaseOrder.builder()
            .purchaseOrderNumber(generatePurchaseOrderNumber())
            .vendorId(original.getVendorId())
            .orderDate(LocalDate.now())
            .deliveryDate(original.getDeliveryDate())
            .deliveryAddress(original.getDeliveryAddress())
            .shipmentPreference(original.getShipmentPreference())
            .paymentTerms(original.getPaymentTerms())
            .taxInclusive(original.getTaxInclusive())
            .discount(original.getDiscount())
            .discountType(original.getDiscountType())
            .notes(original.getNotes())
            .termsAndConditions(original.getTermsAndConditions())
            .status(PurchaseOrder.PurchaseOrderStatus.DRAFT)
            .billedStatus(PurchaseOrder.BilledStatus.NOT_BILLED)
            .build();
        
        // Clone items
        for (PurchaseOrderItem item : original.getItems()) {
            PurchaseOrderItem clonedItem = PurchaseOrderItem.builder()
                .itemDetails(item.getItemDetails())
                .account(item.getAccount())
                .quantity(item.getQuantity())
                .rate(item.getRate())
                .taxRate(item.getTaxRate())
                .amount(item.getAmount())
                .sequence(item.getSequence())
                .build();
            cloned.addItem(clonedItem);
        }
        
        calculateTotals(cloned);
        PurchaseOrder savedPO = purchaseOrderRepository.save(cloned);
        
        return convertToDTO(savedPO);
    }
    
    public PurchaseOrderDTO updateBilledStatus(Long id, PurchaseOrder.BilledStatus billedStatus) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Purchase Order not found with id: " + id));
        
        po.setBilledStatus(billedStatus);
        PurchaseOrder updatedPO = purchaseOrderRepository.save(po);
        
        return convertToDTO(updatedPO);
    }
    
    public List<PurchaseOrderDTO> getPurchaseOrdersByVendor(Long vendorId) {
        return purchaseOrderRepository.findByVendorId(vendorId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<PurchaseOrderDTO> searchPurchaseOrders(String query) {
        return purchaseOrderRepository.searchPurchaseOrders(query).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    private void calculateTotals(PurchaseOrder po) {
        // Calculate subtotal from items
        BigDecimal subtotal = po.getItems().stream()
            .map(item -> {
                item.calculateAmount();
                return item.getAmount();
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        po.setSubtotal(subtotal);
        
        // Apply discount
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (po.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            if (po.getDiscountType() == PurchaseOrder.DiscountType.PERCENTAGE) {
                discountAmount = subtotal.multiply(po.getDiscount()).divide(new BigDecimal("100"));
            } else {
                discountAmount = po.getDiscount();
            }
        }
        
        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        
        // Calculate tax if not inclusive
        BigDecimal taxAmount = BigDecimal.ZERO;
        if (!po.getTaxInclusive()) {
            taxAmount = po.getItems().stream()
                .map(item -> item.getAmount().multiply(item.getTaxRate()).divide(new BigDecimal("100")))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        
        po.setTax(taxAmount);
        po.setTotal(afterDiscount.add(taxAmount));
    }
    
    private String generatePurchaseOrderNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        Long count = purchaseOrderRepository.count() + 1;
        return String.format("PO-%s-%03d", year, count);
    }
    
    private PurchaseOrderDTO convertToDTO(PurchaseOrder po) {
        List<PurchaseOrderItemDTO> itemDTOs = po.getItems().stream()
            .map(this::convertItemToDTO)
            .collect(Collectors.toList());
        
        return PurchaseOrderDTO.builder()
            .id(po.getId())
            .purchaseOrderNumber(po.getPurchaseOrderNumber())
            .referenceNumber(po.getReferenceNumber())
            .vendorId(po.getVendorId())
            .orderDate(po.getOrderDate())
            .deliveryDate(po.getDeliveryDate())
            .deliveryAddress(po.getDeliveryAddress())
            .shipmentPreference(po.getShipmentPreference() != null ? po.getShipmentPreference().name() : null)
            .paymentTerms(po.getPaymentTerms() != null ? po.getPaymentTerms().name() : null)
            .taxInclusive(po.getTaxInclusive())
            .subtotal(po.getSubtotal())
            .discount(po.getDiscount())
            .discountType(po.getDiscountType() != null ? po.getDiscountType().name() : null)
            .tax(po.getTax())
            .total(po.getTotal())
            .status(po.getStatus() != null ? po.getStatus().name() : null)
            .billedStatus(po.getBilledStatus() != null ? po.getBilledStatus().name() : null)
            .notes(po.getNotes())
            .termsAndConditions(po.getTermsAndConditions())
            .attachments(po.getAttachments())
            .items(itemDTOs)
            .createdBy(po.getCreatedBy())
            .createdAt(po.getCreatedAt())
            .updatedAt(po.getUpdatedAt())
            .build();
    }
    
    private PurchaseOrderItemDTO convertItemToDTO(PurchaseOrderItem item) {
        return PurchaseOrderItemDTO.builder()
            .id(item.getId())
            .itemDetails(item.getItemDetails())
            .account(item.getAccount())
            .quantity(item.getQuantity())
            .rate(item.getRate())
            .taxRate(item.getTaxRate())
            .amount(item.getAmount())
            .sequence(item.getSequence())
            .build();
    }
    
    private PurchaseOrder convertToEntity(PurchaseOrderDTO dto) {
        PurchaseOrder po = PurchaseOrder.builder()
            .purchaseOrderNumber(dto.getPurchaseOrderNumber())
            .referenceNumber(dto.getReferenceNumber())
            .vendorId(dto.getVendorId())
            .orderDate(dto.getOrderDate())
            .deliveryDate(dto.getDeliveryDate())
            .deliveryAddress(dto.getDeliveryAddress())
            .shipmentPreference(dto.getShipmentPreference() != null ? 
                PurchaseOrder.ShipmentPreference.valueOf(dto.getShipmentPreference()) : null)
            .paymentTerms(dto.getPaymentTerms() != null ? 
                PurchaseOrder.PaymentTerms.valueOf(dto.getPaymentTerms()) : null)
            .taxInclusive(dto.getTaxInclusive())
            .discount(dto.getDiscount())
            .discountType(dto.getDiscountType() != null ? 
                PurchaseOrder.DiscountType.valueOf(dto.getDiscountType()) : null)
            .status(dto.getStatus() != null ? 
                PurchaseOrder.PurchaseOrderStatus.valueOf(dto.getStatus()) : PurchaseOrder.PurchaseOrderStatus.DRAFT)
            .billedStatus(PurchaseOrder.BilledStatus.NOT_BILLED)
            .notes(dto.getNotes())
            .termsAndConditions(dto.getTermsAndConditions())
            .attachments(dto.getAttachments())
            .createdBy(dto.getCreatedBy())
            .build();
        
        if (dto.getItems() != null) {
            for (PurchaseOrderItemDTO itemDTO : dto.getItems()) {
                PurchaseOrderItem item = convertItemToEntity(itemDTO);
                po.addItem(item);
            }
        }
        
        return po;
    }
    
    private PurchaseOrderItem convertItemToEntity(PurchaseOrderItemDTO dto) {
        return PurchaseOrderItem.builder()
            .itemDetails(dto.getItemDetails())
            .account(dto.getAccount())
            .quantity(dto.getQuantity())
            .rate(dto.getRate())
            .taxRate(dto.getTaxRate())
            .amount(dto.getAmount())
            .sequence(dto.getSequence())
            .build();
    }
    
    private void updatePurchaseOrderFields(PurchaseOrder po, PurchaseOrderDTO dto) {
        po.setReferenceNumber(dto.getReferenceNumber());
        po.setVendorId(dto.getVendorId());
        po.setOrderDate(dto.getOrderDate());
        po.setDeliveryDate(dto.getDeliveryDate());
        po.setDeliveryAddress(dto.getDeliveryAddress());
        po.setShipmentPreference(dto.getShipmentPreference() != null ? 
            PurchaseOrder.ShipmentPreference.valueOf(dto.getShipmentPreference()) : null);
        po.setPaymentTerms(dto.getPaymentTerms() != null ? 
            PurchaseOrder.PaymentTerms.valueOf(dto.getPaymentTerms()) : null);
        po.setTaxInclusive(dto.getTaxInclusive());
        po.setDiscount(dto.getDiscount());
        po.setDiscountType(dto.getDiscountType() != null ? 
            PurchaseOrder.DiscountType.valueOf(dto.getDiscountType()) : null);
        po.setStatus(dto.getStatus() != null ? 
            PurchaseOrder.PurchaseOrderStatus.valueOf(dto.getStatus()) : po.getStatus());
        po.setNotes(dto.getNotes());
        po.setTermsAndConditions(dto.getTermsAndConditions());
        po.setAttachments(dto.getAttachments());
        
        // Update items
        po.getItems().clear();
        if (dto.getItems() != null) {
            for (PurchaseOrderItemDTO itemDTO : dto.getItems()) {
                PurchaseOrderItem item = convertItemToEntity(itemDTO);
                po.addItem(item);
            }
        }
    }
}