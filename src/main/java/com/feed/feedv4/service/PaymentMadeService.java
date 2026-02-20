package com.feed.feedv4.service;

import com.feed.feedv4.dto.AccountingEntryDTO;
import com.feed.feedv4.dto.BillPaymentDTO;
import com.feed.feedv4.dto.PaymentMadeDTO;
import com.feed.feedv4.model.AccountingEntry;
import com.feed.feedv4.model.BillPayment;
import com.feed.feedv4.model.PaymentMade;
import com.feed.feedv4.repository.BillRepository;
import com.feed.feedv4.repository.PaymentMadeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentMadeService {

    private final PaymentMadeRepository paymentMadeRepository;
    private final BillRepository billRepository;

    // Hardcoded account map — paidThroughAccountId -> accountName (no accounts table)
    private static final Map<Long, String> ACCOUNT_NAMES = Map.of(
        1L, "Primary Bank Account - BOC",
        2L, "Secondary Bank Account - Commercial",
        3L, "Cash on Hand",
        4L, "Petty Cash"
    );

    // ─── READ ─────────────────────────────────────────────────────────────────

    public List<PaymentMadeDTO> getAllPayments() {
        return paymentMadeRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public PaymentMadeDTO getPaymentById(Long id) {
        PaymentMade payment = paymentMadeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        return convertToDTO(payment);
    }

    public List<PaymentMadeDTO> getPaymentsByVendor(Long vendorId) {
        return paymentMadeRepository.findByVendorId(vendorId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<PaymentMadeDTO> searchPayments(String query) {
        return paymentMadeRepository.searchPayments(query).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    // ─── CREATE ───────────────────────────────────────────────────────────────

    public PaymentMadeDTO createPayment(PaymentMadeDTO dto) {
        if (dto.getPaymentNumber() == null || dto.getPaymentNumber().isBlank()) {
            dto.setPaymentNumber(generatePaymentNumber());
        }
        if (paymentMadeRepository.existsByPaymentNumber(dto.getPaymentNumber())) {
            throw new RuntimeException("Payment number " + dto.getPaymentNumber() + " already exists");
        }

        PaymentMade payment = convertToEntity(dto);
        generateAccountingEntries(payment);

        PaymentMade saved = paymentMadeRepository.save(payment);

        if (saved.getStatus() == PaymentMade.PaymentStatus.PAID) {
            applyBillPayments(saved);
        }

        return convertToDTO(saved);
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    public PaymentMadeDTO updatePayment(Long id, PaymentMadeDTO dto) {
        PaymentMade existing = paymentMadeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));

        if (existing.getStatus() == PaymentMade.PaymentStatus.VOID) {
            throw new RuntimeException("Cannot update a voided payment");
        }

        if (existing.getStatus() == PaymentMade.PaymentStatus.PAID) {
            reverseBillPayments(existing);
        }

        updatePaymentFields(existing, dto);
        existing.getAccountingEntries().clear();
        generateAccountingEntries(existing);

        PaymentMade saved = paymentMadeRepository.save(existing);

        if (saved.getStatus() == PaymentMade.PaymentStatus.PAID) {
            applyBillPayments(saved);
        }

        return convertToDTO(saved);
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    public void deletePayment(Long id) {
        PaymentMade payment = paymentMadeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));

        if (payment.getStatus() == PaymentMade.PaymentStatus.PAID) {
            throw new RuntimeException("Cannot delete a paid payment. Please void it first.");
        }

        paymentMadeRepository.delete(payment);
    }

    // ─── VOID ─────────────────────────────────────────────────────────────────

    public PaymentMadeDTO voidPayment(Long id) {
        PaymentMade payment = paymentMadeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));

        if (payment.getStatus() == PaymentMade.PaymentStatus.VOID) {
            throw new RuntimeException("Payment is already voided");
        }

        if (payment.getStatus() == PaymentMade.PaymentStatus.PAID) {
            reverseBillPayments(payment);
        }

        payment.voidPayment();
        return convertToDTO(paymentMadeRepository.save(payment));
    }

    // ─── BILL PAYMENT HELPERS ─────────────────────────────────────────────────

    private void applyBillPayments(PaymentMade payment) {
        for (BillPayment bp : payment.getBillPayments()) {
            billRepository.findById(bp.getBillId()).ifPresent(bill -> {
                bill.recordPayment(bp.getPaymentAmount());
                billRepository.save(bill);
            });
        }
    }

    private void reverseBillPayments(PaymentMade payment) {
        for (BillPayment bp : payment.getBillPayments()) {
            billRepository.findById(bp.getBillId()).ifPresent(bill -> {
                bill.reversePayment(bp.getPaymentAmount());
                billRepository.save(bill);
            });
        }
    }

    // ─── ACCOUNTING ENTRIES ───────────────────────────────────────────────────

    private void generateAccountingEntries(PaymentMade payment) {
        String paidThroughName = ACCOUNT_NAMES.getOrDefault(payment.getPaidThroughAccountId(), "Bank Account");
        int seq = 0;

        BigDecimal totalBillPayments = payment.getBillPayments().stream()
            .map(BillPayment::getPaymentAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Debit: Accounts Payable
        if (totalBillPayments.compareTo(BigDecimal.ZERO) > 0) {
            payment.addAccountingEntry(AccountingEntry.builder()
                .paymentMade(payment)
                .accountName("Accounts Payable")
                .debit(totalBillPayments)
                .credit(BigDecimal.ZERO)
                .sequence(seq++)
                .build());
        }

        // Credit: Paid Through Account
        payment.addAccountingEntry(AccountingEntry.builder()
            .paymentMade(payment)
            .accountName(paidThroughName)
            .debit(BigDecimal.ZERO)
            .credit(payment.getPaymentMade())
            .sequence(seq++)
            .build());

        // Debit: Bank Charges
        if (payment.getBankCharges().compareTo(BigDecimal.ZERO) > 0) {
            payment.addAccountingEntry(AccountingEntry.builder()
                .paymentMade(payment)
                .accountName("Bank Charges")
                .debit(payment.getBankCharges())
                .credit(BigDecimal.ZERO)
                .sequence(seq)
                .build());
        }
    }

    // ─── NUMBER GENERATION ────────────────────────────────────────────────────

    private String generatePaymentNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        Long count = paymentMadeRepository.count() + 1;
        return String.format("PMT-%s-%03d", year, count);
    }

    // ─── CONVERSION ───────────────────────────────────────────────────────────

    private PaymentMadeDTO convertToDTO(PaymentMade payment) {
        // BillPayment entity only stores billId + paymentAmount + paymentDate.
        // Enrich the DTO with bill details by looking up from BillRepository.
        List<BillPaymentDTO> bpDTOs = payment.getBillPayments().stream()
            .map(bp -> {
                BillPaymentDTO.BillPaymentDTOBuilder builder = BillPaymentDTO.builder()
                    .id(bp.getId())
                    .billId(bp.getBillId())
                    .paymentAmount(bp.getPaymentAmount())
                    .paymentDate(bp.getPaymentDate());

                billRepository.findById(bp.getBillId()).ifPresent(bill -> {
                    builder.billNumber(bill.getBillNumber());
                    builder.poNumber(bill.getOrderNumber());
                    builder.billDate(bill.getBillDate());
                    builder.billAmount(bill.getTotal());
                    builder.amountDue(bill.getBalanceDue());
                });

                return builder.build();
            })
            .collect(Collectors.toList());

        List<AccountingEntryDTO> aeDTOs = payment.getAccountingEntries().stream()
            .map(e -> AccountingEntryDTO.builder()
                .id(e.getId())
                .accountName(e.getAccountName())
                .debit(e.getDebit())
                .credit(e.getCredit())
                .sequence(e.getSequence())
                .build())
            .collect(Collectors.toList());

        return PaymentMadeDTO.builder()
            .id(payment.getId())
            .paymentNumber(payment.getPaymentNumber())
            .referenceNumber(payment.getReferenceNumber())
            .orderNumber(payment.getOrderNumber())
            .vendorId(payment.getVendorId())
            .vendorName(payment.getVendorName())
            .paymentDate(payment.getPaymentDate())
            .paymentMode(payment.getPaymentMode() != null ? payment.getPaymentMode().name() : null)
            .paidThroughAccountId(payment.getPaidThroughAccountId())
            .paidThroughAccountName(ACCOUNT_NAMES.getOrDefault(payment.getPaidThroughAccountId(), ""))
            .paymentMade(payment.getPaymentMade())
            .bankCharges(payment.getBankCharges())
            .amountPaid(payment.getAmountPaid())
            .amountUsed(payment.getAmountUsed())
            .amountRefunded(payment.getAmountRefunded())
            .amountInExcess(payment.getAmountInExcess())
            .status(payment.getStatus() != null ? payment.getStatus().name() : null)
            .notes(payment.getNotes())
            .attachments(payment.getAttachments())
            .billPayments(bpDTOs)
            .accountingEntries(aeDTOs)
            .createdBy(payment.getCreatedBy())
            .createdAt(payment.getCreatedAt())
            .updatedAt(payment.getUpdatedAt())
            .build();
    }

    private PaymentMade convertToEntity(PaymentMadeDTO dto) {
        PaymentMade payment = PaymentMade.builder()
            .paymentNumber(dto.getPaymentNumber())
            .referenceNumber(dto.getReferenceNumber())
            .orderNumber(dto.getOrderNumber())
            .vendorId(dto.getVendorId())
            .vendorName(dto.getVendorName())
            .paymentDate(dto.getPaymentDate())
            .paymentMode(dto.getPaymentMode() != null
                ? PaymentMade.PaymentMode.valueOf(dto.getPaymentMode())
                : PaymentMade.PaymentMode.BANK_TRANSFER)
            .paidThroughAccountId(dto.getPaidThroughAccountId() != null ? dto.getPaidThroughAccountId() : 1L)
            .paymentMade(dto.getPaymentMade() != null ? dto.getPaymentMade() : BigDecimal.ZERO)
            .bankCharges(dto.getBankCharges() != null ? dto.getBankCharges() : BigDecimal.ZERO)
            .amountPaid(BigDecimal.ZERO)
            .amountUsed(BigDecimal.ZERO)
            .amountRefunded(BigDecimal.ZERO)
            .amountInExcess(BigDecimal.ZERO)
            .status(dto.getStatus() != null
                ? PaymentMade.PaymentStatus.valueOf(dto.getStatus())
                : PaymentMade.PaymentStatus.DRAFT)
            .notes(dto.getNotes())
            .attachments(dto.getAttachments())
            .createdBy(dto.getCreatedBy())
            .build();

        if (dto.getBillPayments() != null) {
            for (BillPaymentDTO bpDTO : dto.getBillPayments()) {
                if (bpDTO.getBillId() == null) continue;
                BillPayment bp = BillPayment.builder()
                    .billId(bpDTO.getBillId())
                    .paymentAmount(bpDTO.getPaymentAmount() != null ? bpDTO.getPaymentAmount() : BigDecimal.ZERO)
                    .paymentDate(bpDTO.getPaymentDate() != null ? bpDTO.getPaymentDate() : dto.getPaymentDate())
                    .build();
                payment.addBillPayment(bp);
            }
        }

        return payment;
    }

    private void updatePaymentFields(PaymentMade payment, PaymentMadeDTO dto) {
        payment.setReferenceNumber(dto.getReferenceNumber());
        payment.setOrderNumber(dto.getOrderNumber());
        payment.setVendorId(dto.getVendorId());
        payment.setVendorName(dto.getVendorName());
        payment.setPaymentDate(dto.getPaymentDate());
        payment.setPaymentMode(dto.getPaymentMode() != null
            ? PaymentMade.PaymentMode.valueOf(dto.getPaymentMode())
            : PaymentMade.PaymentMode.BANK_TRANSFER);
        payment.setPaidThroughAccountId(dto.getPaidThroughAccountId() != null ? dto.getPaidThroughAccountId() : 1L);
        payment.setPaymentMade(dto.getPaymentMade() != null ? dto.getPaymentMade() : BigDecimal.ZERO);
        payment.setBankCharges(dto.getBankCharges() != null ? dto.getBankCharges() : BigDecimal.ZERO);
        payment.setStatus(dto.getStatus() != null
            ? PaymentMade.PaymentStatus.valueOf(dto.getStatus())
            : PaymentMade.PaymentStatus.DRAFT);
        payment.setNotes(dto.getNotes());
        payment.setAttachments(dto.getAttachments());

        payment.getBillPayments().clear();
        if (dto.getBillPayments() != null) {
            for (BillPaymentDTO bpDTO : dto.getBillPayments()) {
                if (bpDTO.getBillId() == null) continue;
                BillPayment bp = BillPayment.builder()
                    .billId(bpDTO.getBillId())
                    .paymentAmount(bpDTO.getPaymentAmount() != null ? bpDTO.getPaymentAmount() : BigDecimal.ZERO)
                    .paymentDate(bpDTO.getPaymentDate() != null ? bpDTO.getPaymentDate() : dto.getPaymentDate())
                    .build();
                payment.addBillPayment(bp);
            }
        }
    }
}