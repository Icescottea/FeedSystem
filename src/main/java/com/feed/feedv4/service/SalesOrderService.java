package com.feed.feedv4.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.feed.feedv4.dto.SalesOrderDTO;
import com.feed.feedv4.dto.SalesOrderItemDTO;
import com.feed.feedv4.model.SalesOrder;
import com.feed.feedv4.model.SalesOrderItem;
import com.feed.feedv4.repository.SalesOrderItemRepository;
import com.feed.feedv4.repository.SalesOrderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final SalesOrderItemRepository salesOrderItemRepository;

    /* -------------------- CRUD -------------------- */

    public List<SalesOrderDTO> getAllSalesOrders() {
        return salesOrderRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SalesOrderDTO getSalesOrderById(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales order not found: " + id));
        return convertToDTO(order);
    }

    public SalesOrderDTO createSalesOrder(SalesOrderDTO dto) {
        dto.setSalesOrderNumber(generateSalesOrderNumber());

        SalesOrder order = convertToEntity(dto);
        calculateTotals(order);

        SalesOrder saved = salesOrderRepository.save(order);
        return convertToDTO(saved);
    }

    public SalesOrderDTO updateSalesOrder(Long id, SalesOrderDTO dto) {
        SalesOrder existing = salesOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales order not found: " + id));

        if (existing.getStatus() == SalesOrder.SalesOrderStatus.VOID) {
            throw new RuntimeException("Cannot update a voided sales order");
        }

        updateFields(existing, dto);
        calculateTotals(existing);

        return convertToDTO(salesOrderRepository.save(existing));
    }

    public void deleteSalesOrder(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales order not found: " + id));

        if (order.getStatus() != SalesOrder.SalesOrderStatus.DRAFT) {
            throw new RuntimeException("Only draft sales orders can be deleted");
        }

        salesOrderRepository.delete(order);
    }

    /* -------------------- BUSINESS ACTIONS -------------------- */

    public SalesOrderDTO cloneSalesOrder(Long id) {
        SalesOrder original = salesOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales order not found: " + id));

        SalesOrder cloned = SalesOrder.builder()
                .salesOrderNumber(generateSalesOrderNumber())
                .referenceNumber(original.getReferenceNumber())
                .customerId(original.getCustomerId())
                .salesOrderDate(LocalDate.now())
                .expectedShipmentDate(original.getExpectedShipmentDate())
                .paymentTerms(original.getPaymentTerms())
                .deliveryMethod(original.getDeliveryMethod())
                .salesPerson(original.getSalesPerson())
                .shippingCharges(original.getShippingCharges())
                .customerNotes(original.getCustomerNotes())
                .termsAndConditions(original.getTermsAndConditions())
                .attachments(original.getAttachments())
                .status(SalesOrder.SalesOrderStatus.DRAFT)
                .invoicedStatus(SalesOrder.InvoicedStatus.NOT_INVOICED)
                .paymentStatus(SalesOrder.PaymentStatus.UNPAID)
                .orderStatus(SalesOrder.OrderStatus.PENDING)
                .build();

        for (SalesOrderItem item : original.getItems()) {
            SalesOrderItem clonedItem = SalesOrderItem.builder()
                    .itemName(item.getItemName())
                    .quantity(item.getQuantity())
                    .rate(item.getRate())
                    .tax(item.getTax())
                    .sequence(item.getSequence())
                    .build();
            cloned.addItem(clonedItem);
        }

        calculateTotals(cloned);
        return convertToDTO(salesOrderRepository.save(cloned));
    }

    public SalesOrderDTO voidSalesOrder(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales order not found: " + id));

        order.voidOrder();
        return convertToDTO(salesOrderRepository.save(order));
    }

    /* -------------------- HELPERS -------------------- */

    private void calculateTotals(SalesOrder order) {
        BigDecimal subtotal = order.getItems().stream()
                .map(item -> {
                    item.calculateAmount();
                    return item.getAmount();
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setSubtotal(subtotal);

        BigDecimal taxTotal = order.getItems().stream()
                .map(i -> i.getAmount()
                        .multiply(i.getTax())
                        .divide(BigDecimal.valueOf(100)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotal(subtotal
                .add(taxTotal)
                .add(order.getShippingCharges()));
    }

    private String generateSalesOrderNumber() {
        Long count = salesOrderRepository.count() + 1;
        String year = String.valueOf(LocalDate.now().getYear());
        return String.format("SO-%s-%04d", year, count);
    }

    /* -------------------- DTO MAPPING -------------------- */

    private SalesOrderDTO convertToDTO(SalesOrder order) {
        List<SalesOrderItemDTO> items = order.getItems().stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList());

        return SalesOrderDTO.builder()
                .id(order.getId())
                .salesOrderNumber(order.getSalesOrderNumber())
                .referenceNumber(order.getReferenceNumber())
                .customerId(order.getCustomerId())
                .salesOrderDate(order.getSalesOrderDate())
                .expectedShipmentDate(order.getExpectedShipmentDate())
                .paymentTerms(order.getPaymentTerms())
                .deliveryMethod(order.getDeliveryMethod().name())
                .salesPerson(order.getSalesPerson())
                .shippingCharges(order.getShippingCharges())
                .subtotal(order.getSubtotal())
                .total(order.getTotal())
                .status(order.getStatus().name())
                .invoicedStatus(order.getInvoicedStatus().name())
                .paymentStatus(order.getPaymentStatus().name())
                .orderStatus(order.getOrderStatus().name())
                .customerNotes(order.getCustomerNotes())
                .termsAndConditions(order.getTermsAndConditions())
                .attachments(order.getAttachments())
                .items(items)
                .createdBy(order.getCreatedBy())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private SalesOrderItemDTO convertItemToDTO(SalesOrderItem item) {
        return SalesOrderItemDTO.builder()
                .id(item.getId())
                .itemName(item.getItemName())
                .quantity(item.getQuantity())
                .rate(item.getRate())
                .tax(item.getTax())
                .amount(item.getAmount())
                .sequence(item.getSequence())
                .build();
    }

    private SalesOrder convertToEntity(SalesOrderDTO dto) {
        SalesOrder order = SalesOrder.builder()
                .salesOrderNumber(dto.getSalesOrderNumber())
                .referenceNumber(dto.getReferenceNumber())
                .customerId(dto.getCustomerId())
                .salesOrderDate(dto.getSalesOrderDate())
                .expectedShipmentDate(dto.getExpectedShipmentDate())
                .paymentTerms(dto.getPaymentTerms())
                .deliveryMethod(SalesOrder.DeliveryMethod.valueOf(dto.getDeliveryMethod()))
                .salesPerson(dto.getSalesPerson())
                .shippingCharges(dto.getShippingCharges() != null ? dto.getShippingCharges() : BigDecimal.ZERO)
                .customerNotes(dto.getCustomerNotes())
                .termsAndConditions(dto.getTermsAndConditions())
                .attachments(dto.getAttachments())
                .createdBy(dto.getCreatedBy())
                .build();

        if (dto.getItems() != null) {
            for (SalesOrderItemDTO itemDTO : dto.getItems()) {
                SalesOrderItem item = convertItemToEntity(itemDTO);
                order.addItem(item);
            }
        }

        return order;
    }

    private SalesOrderItem convertItemToEntity(SalesOrderItemDTO dto) {
        return SalesOrderItem.builder()
                .itemName(dto.getItemName())
                .quantity(dto.getQuantity())
                .rate(dto.getRate())
                .tax(dto.getTax())
                .amount(dto.getAmount())
                .sequence(dto.getSequence())
                .build();
    }

    private void updateFields(SalesOrder order, SalesOrderDTO dto) {
        order.setReferenceNumber(dto.getReferenceNumber());
        order.setCustomerId(dto.getCustomerId());
        order.setSalesOrderDate(dto.getSalesOrderDate());
        order.setExpectedShipmentDate(dto.getExpectedShipmentDate());
        order.setPaymentTerms(dto.getPaymentTerms());
        order.setDeliveryMethod(SalesOrder.DeliveryMethod.valueOf(dto.getDeliveryMethod()));
        order.setSalesPerson(dto.getSalesPerson());
        order.setShippingCharges(dto.getShippingCharges());
        order.setCustomerNotes(dto.getCustomerNotes());
        order.setTermsAndConditions(dto.getTermsAndConditions());
        order.setAttachments(dto.getAttachments());

        order.getItems().clear();
        if (dto.getItems() != null) {
            for (SalesOrderItemDTO itemDTO : dto.getItems()) {
                order.addItem(convertItemToEntity(itemDTO));
            }
        }
    }
}