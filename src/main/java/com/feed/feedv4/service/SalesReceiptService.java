package com.feed.feedv4.service;

import com.feed.feedv4.dto.SalesReceiptDTO;
import com.feed.feedv4.dto.SalesReceiptItemDTO;
import com.feed.feedv4.model.SalesReceipt;
import com.feed.feedv4.model.SalesReceiptItem;
import com.feed.feedv4.repository.SalesReceiptRepository;
import com.feed.feedv4.repository.SalesReceiptItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SalesReceiptService {

    private final SalesReceiptRepository salesReceiptRepository;
    private final SalesReceiptItemRepository salesReceiptItemRepository;

    // ─── READ ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<SalesReceiptDTO> getAllSalesReceipts() {
        return salesReceiptRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalesReceiptDTO getSalesReceiptById(Long id) {
        SalesReceipt receipt = findById(id);
        return toDTO(receipt);
    }

    // ─── NEXT RECEIPT NUMBER ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public String generateNextReceiptNumber() {
        int year = Year.now().getValue();
        String prefix = "SR-" + year + "-";
        long count = salesReceiptRepository.countByReceiptNumberStartingWith(prefix);
        String seq = String.format("%03d", count + 1);
        return prefix + seq;
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────

    public SalesReceiptDTO createSalesReceipt(SalesReceiptDTO dto) {
        SalesReceipt receipt = toEntity(dto);
        setTotals(receipt, dto);
        SalesReceipt saved = salesReceiptRepository.save(receipt);
        return toDTO(saved);
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────

    public SalesReceiptDTO updateSalesReceipt(Long id, SalesReceiptDTO dto) {
        SalesReceipt existing = findById(id);

        if (existing.getStatus() == SalesReceipt.SalesReceiptStatus.VOID) {
            throw new IllegalStateException("Cannot update a voided sales receipt.");
        }

        existing.setCustomerId(dto.getCustomerId());
        existing.setReceiptDate(dto.getReceiptDate());
        existing.setSalesPerson(dto.getSalesPerson());
        existing.setReferenceNumber(dto.getReferenceNumber());
        existing.setShippingCharges(dto.getShippingCharges() != null ? dto.getShippingCharges() : BigDecimal.ZERO);
        existing.setNotes(dto.getNotes());
        existing.setTermsAndConditions(dto.getTermsAndConditions());
        existing.setDepositTo(dto.getDepositTo());
        existing.setAttachments(dto.getAttachments());

        if (dto.getPaymentMode() != null) {
            existing.setPaymentMode(SalesReceipt.PaymentMode.valueOf(dto.getPaymentMode()));
        }
        if (dto.getStatus() != null) {
            existing.setStatus(SalesReceipt.SalesReceiptStatus.valueOf(dto.getStatus()));
        }

        // Replace items
        existing.getItems().clear();
        if (dto.getItems() != null) {
            int seq = 0;
            for (SalesReceiptItemDTO itemDTO : dto.getItems()) {
                SalesReceiptItem item = toItemEntity(itemDTO);
                item.setSequence(seq++);
                existing.addItem(item);
            }
        }

        setTotals(existing, dto);
        return toDTO(salesReceiptRepository.save(existing));
    }

    // ─── VOID ────────────────────────────────────────────────────────────────

    public SalesReceiptDTO voidSalesReceipt(Long id) {
        SalesReceipt receipt = findById(id);
        receipt.voidReceipt();
        return toDTO(salesReceiptRepository.save(receipt));
    }

    // ─── DELETE ──────────────────────────────────────────────────────────────

    public void deleteSalesReceipt(Long id) {
        SalesReceipt receipt = findById(id);
        if (receipt.getStatus() == SalesReceipt.SalesReceiptStatus.COMPLETED) {
            throw new IllegalStateException("Cannot delete a completed sales receipt. Void it first.");
        }
        salesReceiptRepository.delete(receipt);
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    private SalesReceipt findById(Long id) {
        return salesReceiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales receipt not found with id: " + id));
    }

    private void setTotals(SalesReceipt receipt, SalesReceiptDTO dto) {
        // subtotal = sum of (qty * rate) for all items (before tax)
        BigDecimal subtotal = receipt.getItems().stream()
                .map(i -> i.getQuantity().multiply(i.getRate()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shipping = receipt.getShippingCharges() != null
                ? receipt.getShippingCharges() : BigDecimal.ZERO;

        // total amount per item already includes tax in the item.amount field
        BigDecimal totalWithTax = receipt.getItems().stream()
                .map(SalesReceiptItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        receipt.setSubtotal(subtotal);
        receipt.setTotal(totalWithTax.add(shipping));
    }

    // ─── MAPPING ─────────────────────────────────────────────────────────────

    private SalesReceiptDTO toDTO(SalesReceipt receipt) {
        return SalesReceiptDTO.builder()
                .id(receipt.getId())
                .salesReceiptNumber(receipt.getSalesReceiptNumber())
                .referenceNumber(receipt.getReferenceNumber())
                .customerId(receipt.getCustomerId())
                .receiptDate(receipt.getReceiptDate())
                .salesPerson(receipt.getSalesPerson())
                .shippingCharges(receipt.getShippingCharges())
                .subtotal(receipt.getSubtotal())
                .total(receipt.getTotal())
                .paymentMode(receipt.getPaymentMode() != null ? receipt.getPaymentMode().name() : null)
                .depositTo(receipt.getDepositTo())
                .status(receipt.getStatus() != null ? receipt.getStatus().name() : null)
                .notes(receipt.getNotes())
                .termsAndConditions(receipt.getTermsAndConditions())
                .attachments(receipt.getAttachments())
                .items(receipt.getItems().stream().map(this::toItemDTO).collect(Collectors.toList()))
                .createdBy(receipt.getCreatedBy())
                .createdAt(receipt.getCreatedAt())
                .updatedAt(receipt.getUpdatedAt())
                .build();
    }

    private SalesReceiptItemDTO toItemDTO(SalesReceiptItem item) {
        return SalesReceiptItemDTO.builder()
                .id(item.getId())
                .itemName(item.getItemName())
                .quantity(item.getQuantity())
                .rate(item.getRate())
                .tax(item.getTax())
                .amount(item.getAmount())
                .sequence(item.getSequence())
                .build();
    }

    private SalesReceipt toEntity(SalesReceiptDTO dto) {
        SalesReceipt receipt = SalesReceipt.builder()
                .salesReceiptNumber(dto.getSalesReceiptNumber())
                .referenceNumber(dto.getReferenceNumber())
                .customerId(dto.getCustomerId())
                .receiptDate(dto.getReceiptDate())
                .salesPerson(dto.getSalesPerson())
                .shippingCharges(dto.getShippingCharges() != null ? dto.getShippingCharges() : BigDecimal.ZERO)
                .subtotal(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .paymentMode(dto.getPaymentMode() != null
                        ? SalesReceipt.PaymentMode.valueOf(dto.getPaymentMode())
                        : SalesReceipt.PaymentMode.BANK_TRANSFER)
                .depositTo(dto.getDepositTo())
                .status(dto.getStatus() != null
                        ? SalesReceipt.SalesReceiptStatus.valueOf(dto.getStatus())
                        : SalesReceipt.SalesReceiptStatus.DRAFT)
                .notes(dto.getNotes())
                .termsAndConditions(dto.getTermsAndConditions())
                .attachments(dto.getAttachments())
                .createdBy(dto.getCreatedBy())
                .build();

        if (dto.getItems() != null) {
            int seq = 0;
            for (SalesReceiptItemDTO itemDTO : dto.getItems()) {
                SalesReceiptItem item = toItemEntity(itemDTO);
                item.setSequence(seq++);
                receipt.addItem(item);
            }
        }

        return receipt;
    }

    private SalesReceiptItem toItemEntity(SalesReceiptItemDTO dto) {
        SalesReceiptItem item = SalesReceiptItem.builder()
                .itemName(dto.getItemName())
                .quantity(dto.getQuantity() != null ? dto.getQuantity() : BigDecimal.ZERO)
                .rate(dto.getRate() != null ? dto.getRate() : BigDecimal.ZERO)
                .tax(dto.getTax() != null ? dto.getTax() : BigDecimal.ZERO)
                .amount(dto.getAmount() != null ? dto.getAmount() : BigDecimal.ZERO)
                .sequence(dto.getSequence() != null ? dto.getSequence() : 0)
                .build();
        // Let the frontend pass calculated amount; also recalculate for safety
        item.calculateAmount(); // sets qty * rate; frontend handles tax in amount already
        if (dto.getAmount() != null) {
            item.setAmount(dto.getAmount()); // trust frontend's tax-inclusive amount
        }
        return item;
    }
}