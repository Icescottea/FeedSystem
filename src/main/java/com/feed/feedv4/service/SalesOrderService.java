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

    /* -------------------- CRUD -------------------- */

    public List<SalesOrderDTO> getAllSalesOrders() {
        return salesOrderRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public SalesOrderDTO getSalesOrderById(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales order not found: " + id));
        return mapToDTO(order);
    }

    public SalesOrderDTO createSalesOrder(SalesOrderDTO dto) {
        SalesOrder order = mapToEntity(dto);
        order.setSalesOrderNumber(generateSalesOrderNumber());

        SalesOrder saved = salesOrderRepository.save(order);
        return mapToDTO(saved);
    }

    public SalesOrderDTO updateSalesOrder(Long id, SalesOrderDTO dto) {
        SalesOrder existing = salesOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales order not found: " + id));

        updateFields(existing, dto);

        return mapToDTO(salesOrderRepository.save(existing));
    }

    public void deleteSalesOrder(Long id) {
        salesOrderRepository.deleteById(id);
    }

    /* -------------------- MAPPING -------------------- */

    private SalesOrder mapToEntity(SalesOrderDTO dto) {

        SalesOrder order = SalesOrder.builder()
                .referenceNumber(dto.getReferenceNumber())
                .customerId(dto.getCustomerId())
                .customerName(dto.getCustomerName())
                .salesOrderDate(dto.getSalesOrderDate())
                .expectedShipmentDate(dto.getExpectedShipmentDate())
                .paymentTerms(dto.getPaymentTerms())
                .deliveryMethod(dto.getDeliveryMethod())
                .salesPerson(dto.getSalesPerson())
                .shippingCharges(dto.getShippingCharges())
                .subtotal(dto.getSubtotal())
                .tax(dto.getTax())
                .discount(dto.getDiscount())
                .total(dto.getTotal())
                .status(dto.getStatus())
                .orderStatus(dto.getOrderStatus())
                .paymentStatus(dto.getPaymentStatus())
                .invoicedStatus(dto.getInvoicedStatus())
                .customerNotes(dto.getCustomerNotes())
                .termsAndConditions(dto.getTermsAndConditions())
                .attachments(dto.getAttachments())
                .build();

        if (dto.getItems() != null) {
            dto.getItems().stream()
                    .map(i -> SalesOrderItem.builder()
                            .itemName(i.getItemName())
                            .quantity(i.getQuantity())
                            .rate(i.getRate())
                            .tax(i.getTax())
                            .amount(i.getAmount())
                            .sequence(i.getSequence())
                            .salesOrder(order)
                            .build())
                    .forEach(order::addItem);

        }

        return order;
    }

    private SalesOrderDTO mapToDTO(SalesOrder order) {

        return SalesOrderDTO.builder()
                .id(order.getId())
                .salesOrderNumber(order.getSalesOrderNumber())
                .referenceNumber(order.getReferenceNumber())
                .customerId(order.getCustomerId())
                .customerName(order.getCustomerName())
                .salesOrderDate(order.getSalesOrderDate())
                .expectedShipmentDate(order.getExpectedShipmentDate())
                .paymentTerms(order.getPaymentTerms())
                .deliveryMethod(order.getDeliveryMethod())
                .salesPerson(order.getSalesPerson())
                .shippingCharges(order.getShippingCharges())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .discount(order.getDiscount())
                .total(order.getTotal())
                .status(order.getStatus())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .invoicedStatus(order.getInvoicedStatus())
                .customerNotes(order.getCustomerNotes())
                .termsAndConditions(order.getTermsAndConditions())
                .attachments(order.getAttachments())
                .items(order.getItems() == null ? List.of() : order.getItems().stream()
                        .map(i -> SalesOrderItemDTO.builder()
                                .id(i.getId())
                                .itemName(i.getItemName())
                                .quantity(i.getQuantity())
                                .rate(i.getRate())
                                .tax(i.getTax())
                                .amount(i.getAmount())
                                .sequence(i.getSequence())
                                .build())
                        .toList())
                .build();
    }

    private void updateFields(SalesOrder order, SalesOrderDTO dto) {

        order.setReferenceNumber(dto.getReferenceNumber());
        order.setCustomerId(dto.getCustomerId());
        order.setCustomerName(dto.getCustomerName());
        order.setSalesOrderDate(dto.getSalesOrderDate());
        order.setExpectedShipmentDate(dto.getExpectedShipmentDate());
        order.setPaymentTerms(dto.getPaymentTerms());
        order.setDeliveryMethod(dto.getDeliveryMethod());
        order.setSalesPerson(dto.getSalesPerson());
        order.setShippingCharges(dto.getShippingCharges());
        order.setSubtotal(dto.getSubtotal());
        order.setTax(dto.getTax());
        order.setDiscount(dto.getDiscount());
        order.setTotal(dto.getTotal());
        order.setStatus(dto.getStatus());
        order.setOrderStatus(dto.getOrderStatus());
        order.setPaymentStatus(dto.getPaymentStatus());
        order.setInvoicedStatus(dto.getInvoicedStatus());
        order.setCustomerNotes(dto.getCustomerNotes());
        order.setTermsAndConditions(dto.getTermsAndConditions());
        order.setAttachments(dto.getAttachments());

        order.getItems().clear();

        if (dto.getItems() != null) {
            dto.getItems().stream()
                    .map(i -> SalesOrderItem.builder()
                            .itemName(i.getItemName())
                            .quantity(i.getQuantity())
                            .rate(i.getRate())
                            .tax(i.getTax())
                            .amount(i.getAmount())
                            .sequence(i.getSequence())
                            .salesOrder(order)
                            .build())
                    .forEach(order::addItem); 
        }
    }

    private String generateSalesOrderNumber() {
        return "SO-" + System.currentTimeMillis();
    }
}