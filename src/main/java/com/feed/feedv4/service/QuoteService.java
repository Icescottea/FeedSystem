package com.feed.feedv4.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.feed.feedv4.dto.QuoteDTO;
import com.feed.feedv4.dto.QuoteItemDTO;
import com.feed.feedv4.model.Quote;
import com.feed.feedv4.model.QuoteItem;
import com.feed.feedv4.repository.QuoteItemRepository;
import com.feed.feedv4.repository.QuoteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class QuoteService {
    
    private final QuoteRepository quoteRepository;
    private final QuoteItemRepository quoteItemRepository;
    
    public List<QuoteDTO> getAllQuotes() {
        return quoteRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public QuoteDTO getQuoteById(Long id) {
        Quote quote = quoteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Quote not found with id: " + id));
        return convertToDTO(quote);
    }
    
    public QuoteDTO createQuote(QuoteDTO dto) {
        dto.setQuoteNumber(generateQuoteNumber());

        if (dto.getDiscount() == null) dto.setDiscount(BigDecimal.ZERO);

        if (dto.getTaxInclusive() == null) dto.setTaxInclusive(false);

        if (dto.getAdjustment() == null) dto.setAdjustment(BigDecimal.ZERO);

        if (quoteRepository.existsByQuoteNumber(dto.getQuoteNumber())) {
            throw new RuntimeException("Quote number " + dto.getQuoteNumber() + " already exists");
        }
        
        Quote quote = convertToEntity(dto);
        calculateTotals(quote);
        
        Quote savedQuote = quoteRepository.save(quote);
        return convertToDTO(savedQuote);
    }
    
    public QuoteDTO updateQuote(Long id, QuoteDTO dto) {
        Quote existingQuote = quoteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Quote not found with id: " + id));
        
        updateQuoteFields(existingQuote, dto);
        calculateTotals(existingQuote);
        
        Quote updatedQuote = quoteRepository.save(existingQuote);
        return convertToDTO(updatedQuote);
    }
    
    public void deleteQuote(Long id) {
        Quote quote = quoteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Quote not found with id: " + id));
        
        if (quote.getStatus() == Quote.QuoteStatus.ACCEPTED) {
            throw new RuntimeException("Cannot delete an accepted quote");
        }
        
        quoteRepository.delete(quote);
    }
    
    public QuoteDTO cloneQuote(Long id) {
        Quote original = quoteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Quote not found with id: " + id));
        
        Quote cloned = Quote.builder()
            .quoteNumber(generateQuoteNumber())
            .customerId(original.getCustomerId())
            .quoteDate(LocalDate.now())
            .expiryDate(LocalDate.now().plusDays(30))
            .subject(original.getSubject())
            .salesPerson(original.getSalesPerson())
            .taxInclusive(original.getTaxInclusive())
            .discount(original.getDiscount())
            .discountType(original.getDiscountType())
            .adjustment(original.getAdjustment())
            .customerNotes(original.getCustomerNotes())
            .termsAndConditions(original.getTermsAndConditions())
            .status(Quote.QuoteStatus.DRAFT)
            .build();
        
        for (QuoteItem item : original.getItems()) {
            QuoteItem clonedItem = QuoteItem.builder()
                .itemName(item.getItemName())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .rate(item.getRate())
                .taxRate(item.getTaxRate())
                .amount(item.getAmount())
                .sequence(item.getSequence())
                .build();
            cloned.addItem(clonedItem);
        }
        
        calculateTotals(cloned);
        Quote savedQuote = quoteRepository.save(cloned);
        
        return convertToDTO(savedQuote);
    }
    
    public QuoteDTO markAsAccepted(Long id) {
        Quote quote = quoteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Quote not found with id: " + id));
        
        quote.markAsAccepted();
        Quote updatedQuote = quoteRepository.save(quote);
        
        return convertToDTO(updatedQuote);
    }
    
    public QuoteDTO markAsDeclined(Long id) {
        Quote quote = quoteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Quote not found with id: " + id));
        
        quote.markAsDeclined();
        Quote updatedQuote = quoteRepository.save(quote);
        
        return convertToDTO(updatedQuote);
    }
    
    public List<QuoteDTO> getQuotesByCustomer(Long customerId) {
        return quoteRepository.findByCustomerId(customerId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<QuoteDTO> searchQuotes(String query) {
        return quoteRepository.searchQuotes(query).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<QuoteDTO> getExpiredQuotes() {
        return quoteRepository.findExpiredQuotes(LocalDate.now()).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    private void calculateTotals(Quote quote) {
        BigDecimal subtotal = quote.getItems().stream()
            .map(item -> {
                item.calculateAmount();
                return item.getAmount();
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        quote.setSubtotal(subtotal);
        
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (quote.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            if (quote.getDiscountType() == Quote.DiscountType.PERCENTAGE) {
                discountAmount = subtotal.multiply(quote.getDiscount()).divide(new BigDecimal("100"));
            } else {
                discountAmount = quote.getDiscount();
            }
        }
        
        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        
        BigDecimal taxAmount = BigDecimal.ZERO;
        if (!quote.getTaxInclusive()) {
            taxAmount = quote.getItems().stream()
                .map(item -> item.getAmount().multiply(item.getTaxRate()).divide(new BigDecimal("100")))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        
        quote.setTax(taxAmount);
        quote.setTotal(afterDiscount.add(taxAmount).add(quote.getAdjustment()));
    }
    
    private String generateQuoteNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        Long count = quoteRepository.count() + 1;
        return String.format("QT-%s-%03d", year, count);
    }
    
    private QuoteDTO convertToDTO(Quote quote) {
        List<QuoteItemDTO> itemDTOs = quote.getItems().stream()
            .map(this::convertItemToDTO)
            .collect(Collectors.toList());
        
        return QuoteDTO.builder()
            .id(quote.getId())
            .quoteNumber(quote.getQuoteNumber())
            .referenceNumber(quote.getReferenceNumber())
            .customerId(quote.getCustomerId())
            .quoteDate(quote.getQuoteDate())
            .expiryDate(quote.getExpiryDate())
            .subject(quote.getSubject())
            .salesPerson(quote.getSalesPerson())
            .taxInclusive(quote.getTaxInclusive())
            .subtotal(quote.getSubtotal())
            .discount(quote.getDiscount())
            .discountType(quote.getDiscountType() != null ? quote.getDiscountType().name() : null)
            .tax(quote.getTax())
            .adjustment(quote.getAdjustment())
            .total(quote.getTotal())
            .status(quote.getStatus() != null ? quote.getStatus().name() : null)
            .customerNotes(quote.getCustomerNotes())
            .termsAndConditions(quote.getTermsAndConditions())
            .attachments(quote.getAttachments())
            .items(itemDTOs)
            .createdBy(quote.getCreatedBy())
            .createdAt(quote.getCreatedAt())
            .updatedAt(quote.getUpdatedAt())
            .build();
    }
    
    private QuoteItemDTO convertItemToDTO(QuoteItem item) {
        return QuoteItemDTO.builder()
            .id(item.getId())
            .itemName(item.getItemName())
            .description(item.getDescription())
            .quantity(item.getQuantity())
            .rate(item.getRate())
            .taxRate(item.getTaxRate())
            .amount(item.getAmount())
            .sequence(item.getSequence())
            .build();
    }
    
    private Quote convertToEntity(QuoteDTO dto) {
        Quote quote = Quote.builder()
            .quoteNumber(dto.getQuoteNumber())
            .referenceNumber(dto.getReferenceNumber())
            .customerId(dto.getCustomerId())
            .quoteDate(dto.getQuoteDate())
            .expiryDate(dto.getExpiryDate())
            .subject(dto.getSubject())
            .salesPerson(dto.getSalesPerson())
            .taxInclusive(dto.getTaxInclusive())
            .discount(dto.getDiscount())
            .discountType(dto.getDiscountType() != null ? Quote.DiscountType.valueOf(dto.getDiscountType()) : null)
            .adjustment(dto.getAdjustment() != null ? dto.getAdjustment() : BigDecimal.ZERO)
            .status(dto.getStatus() != null ? Quote.QuoteStatus.valueOf(dto.getStatus()) : Quote.QuoteStatus.DRAFT)
            .customerNotes(dto.getCustomerNotes())
            .termsAndConditions(dto.getTermsAndConditions())
            .attachments(dto.getAttachments())
            .createdBy(dto.getCreatedBy())
            .build();
        
        if (dto.getItems() != null) {
            for (QuoteItemDTO itemDTO : dto.getItems()) {
                QuoteItem item = convertItemToEntity(itemDTO);
                quote.addItem(item);
            }
        }
        
        return quote;
    }
    
    private QuoteItem convertItemToEntity(QuoteItemDTO dto) {
        return QuoteItem.builder()
            .itemName(dto.getItemName())
            .description(dto.getDescription())
            .quantity(dto.getQuantity())
            .rate(dto.getRate())
            .taxRate(dto.getTaxRate())
            .amount(dto.getAmount())
            .sequence(dto.getSequence())
            .build();
    }
    
    private void updateQuoteFields(Quote quote, QuoteDTO dto) {
        quote.setReferenceNumber(dto.getReferenceNumber());
        quote.setCustomerId(dto.getCustomerId());
        quote.setQuoteDate(dto.getQuoteDate());
        quote.setExpiryDate(dto.getExpiryDate());
        quote.setSubject(dto.getSubject());
        quote.setSalesPerson(dto.getSalesPerson());
        quote.setTaxInclusive(dto.getTaxInclusive());
        quote.setDiscount(dto.getDiscount());
        quote.setDiscountType(dto.getDiscountType() != null ? Quote.DiscountType.valueOf(dto.getDiscountType()) : null);
        quote.setAdjustment(dto.getAdjustment() != null ? dto.getAdjustment() : BigDecimal.ZERO);
        quote.setCustomerNotes(dto.getCustomerNotes());
        quote.setTermsAndConditions(dto.getTermsAndConditions());
        quote.setAttachments(dto.getAttachments());
        
        quote.getItems().clear();
        if (dto.getItems() != null) {
            for (QuoteItemDTO itemDTO : dto.getItems()) {
                QuoteItem item = convertItemToEntity(itemDTO);
                quote.addItem(item);
            }
        }
    }
}