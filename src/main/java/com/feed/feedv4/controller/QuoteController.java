package com.feed.feedv4.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.feed.feedv4.dto.QuoteDTO;
import com.feed.feedv4.service.QuoteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/quotes")

public class QuoteController {
    
    private final QuoteService quoteService;

    public QuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
    }
    
    @GetMapping
    public ResponseEntity<List<QuoteDTO>> getAllQuotes() {
        List<QuoteDTO> quotes = quoteService.getAllQuotes();
        return ResponseEntity.ok(quotes);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<QuoteDTO> getQuoteById(@PathVariable Long id) {
        QuoteDTO quote = quoteService.getQuoteById(id);
        return ResponseEntity.ok(quote);
    }
    
    @PostMapping
    public ResponseEntity<QuoteDTO> createQuote(@Valid @RequestBody QuoteDTO dto) {
        QuoteDTO created = quoteService.createQuote(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<QuoteDTO> updateQuote(
            @PathVariable Long id,
            @Valid @RequestBody QuoteDTO dto) {
        QuoteDTO updated = quoteService.updateQuote(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuote(@PathVariable Long id) {
        quoteService.deleteQuote(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/clone")
    public ResponseEntity<QuoteDTO> cloneQuote(@PathVariable Long id) {
        QuoteDTO cloned = quoteService.cloneQuote(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(cloned);
    }
    
    @PostMapping("/{id}/mark-accepted")
    public ResponseEntity<QuoteDTO> markAsAccepted(@PathVariable Long id) {
        QuoteDTO updated = quoteService.markAsAccepted(id);
        return ResponseEntity.ok(updated);
    }
    
    @PostMapping("/{id}/mark-declined")
    public ResponseEntity<QuoteDTO> markAsDeclined(@PathVariable Long id) {
        QuoteDTO updated = quoteService.markAsDeclined(id);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<QuoteDTO>> getQuotesByCustomer(@PathVariable Long customerId) {
        List<QuoteDTO> quotes = quoteService.getQuotesByCustomer(customerId);
        return ResponseEntity.ok(quotes);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<QuoteDTO>> searchQuotes(@RequestParam String query) {
        List<QuoteDTO> quotes = quoteService.searchQuotes(query);
        return ResponseEntity.ok(quotes);
    }
    
    @GetMapping("/expired")
    public ResponseEntity<List<QuoteDTO>> getExpiredQuotes() {
        List<QuoteDTO> quotes = quoteService.getExpiredQuotes();
        return ResponseEntity.ok(quotes);
    }
}