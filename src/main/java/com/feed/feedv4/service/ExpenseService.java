package com.feed.feedv4.service;

import com.feed.feedv4.dto.ExpenseDTO;
import com.feed.feedv4.dto.ExpenseAccountingEntryDTO;
import com.feed.feedv4.model.Expense;
import com.feed.feedv4.model.ExpenseAccountingEntry;
import com.feed.feedv4.repository.ExpenseRepository;
import com.feed.feedv4.repository.ExpenseAccountingEntryRepository;
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
public class ExpenseService {
    
    private final ExpenseRepository expenseRepository;
    private final ExpenseAccountingEntryRepository accountingEntryRepository;
    
    public List<ExpenseDTO> getAllExpenses() {
        return expenseRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public ExpenseDTO getExpenseById(Long id) {
        Expense expense = expenseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
        return convertToDTO(expense);
    }
    
    public ExpenseDTO createExpense(ExpenseDTO expenseDTO) {
        // Validate reference number uniqueness if provided
        if (expenseDTO.getReferenceNumber() != null && 
            !expenseDTO.getReferenceNumber().isEmpty() &&
            expenseRepository.existsByReferenceNumber(expenseDTO.getReferenceNumber())) {
            throw new RuntimeException("Expense with reference number " + expenseDTO.getReferenceNumber() + " already exists");
        }
        
        // Validate date is not in future
        if (expenseDTO.getDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("Expense date cannot be in the future");
        }
        
        // Validate amount
        if (expenseDTO.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Expense amount must be greater than zero");
        }
        
        Expense expense = convertToEntity(expenseDTO);
        Expense savedExpense = expenseRepository.save(expense);
        
        // Generate accounting entries
        generateAccountingEntries(savedExpense);
        
        return convertToDTO(savedExpense);
    }
    
    public ExpenseDTO updateExpense(Long id, ExpenseDTO expenseDTO) {
        Expense existingExpense = expenseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
        
        // Validate reference number uniqueness (exclude current expense)
        if (expenseDTO.getReferenceNumber() != null &&
            !expenseDTO.getReferenceNumber().equals(existingExpense.getReferenceNumber()) &&
            expenseRepository.existsByReferenceNumber(expenseDTO.getReferenceNumber())) {
            throw new RuntimeException("Expense with reference number " + expenseDTO.getReferenceNumber() + " already exists");
        }
        
        updateExpenseFields(existingExpense, expenseDTO);
        
        // Clear and regenerate accounting entries
        existingExpense.getAccountingEntries().clear();
        Expense updatedExpense = expenseRepository.save(existingExpense);
        generateAccountingEntries(updatedExpense);
        
        return convertToDTO(updatedExpense);
    }
    
    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
        
        expenseRepository.delete(expense);
    }
    
    public List<ExpenseDTO> searchExpenses(String query) {
        return expenseRepository.searchExpenses(query).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<ExpenseDTO> getExpensesByStatus(Expense.ExpenseStatus status) {
        return expenseRepository.findByStatus(status).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<ExpenseDTO> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByDateBetween(startDate, endDate).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    private void generateAccountingEntries(Expense expense) {
        // Entry 1: Debit Expense Account
        ExpenseAccountingEntry debitEntry = ExpenseAccountingEntry.builder()
            .account(expense.getExpenseAccount())
            .debit(expense.getNetAmount())
            .credit(BigDecimal.ZERO)
            .sequence(0)
            .build();
        expense.addAccountingEntry(debitEntry);
        
        // Entry 2: Credit Payment Account
        ExpenseAccountingEntry creditEntry = ExpenseAccountingEntry.builder()
            .account(expense.getPaidThrough())
            .debit(BigDecimal.ZERO)
            .credit(expense.getNetAmount())
            .sequence(1)
            .build();
        expense.addAccountingEntry(creditEntry);
        
        expenseRepository.save(expense);
    }
    
    private ExpenseDTO convertToDTO(Expense expense) {
        List<ExpenseAccountingEntryDTO> entryDTOs = expense.getAccountingEntries().stream()
            .map(this::convertAccountingEntryToDTO)
            .collect(Collectors.toList());
        
        return ExpenseDTO.builder()
            .id(expense.getId())
            .date(expense.getDate())
            .expenseAccount(expense.getExpenseAccount())
            .referenceNumber(expense.getReferenceNumber())
            .vendorId(expense.getVendorId())
            .vendorName(expense.getVendorName())
            .paidThrough(expense.getPaidThrough())
            .customerId(expense.getCustomerId())
            .customerName(expense.getCustomerName())
            .amount(expense.getAmount())
            .taxInclusive(expense.getTaxInclusive())
            .tax(expense.getTax())
            .netAmount(expense.getNetAmount())
            .status(expense.getStatus() != null ? expense.getStatus().name() : null)
            .notes(expense.getNotes())
            .department(expense.getDepartment())
            .location(expense.getLocation())
            .attachments(expense.getAttachments())
            .accountingEntries(entryDTOs)
            .createdBy(expense.getCreatedBy())
            .createdAt(expense.getCreatedAt())
            .updatedAt(expense.getUpdatedAt())
            .build();
    }
    
    private ExpenseAccountingEntryDTO convertAccountingEntryToDTO(ExpenseAccountingEntry entry) {
        return ExpenseAccountingEntryDTO.builder()
            .id(entry.getId())
            .account(entry.getAccount())
            .debit(entry.getDebit())
            .credit(entry.getCredit())
            .sequence(entry.getSequence())
            .build();
    }
    
    private Expense convertToEntity(ExpenseDTO dto) {
        return Expense.builder()
            .date(dto.getDate())
            .expenseAccount(dto.getExpenseAccount())
            .referenceNumber(dto.getReferenceNumber())
            .vendorId(dto.getVendorId())
            .vendorName(dto.getVendorName())
            .paidThrough(dto.getPaidThrough())
            .customerId(dto.getCustomerId())
            .customerName(dto.getCustomerName())
            .amount(dto.getAmount())
            .taxInclusive(dto.getTaxInclusive())
            .tax(dto.getTax())
            .status(dto.getStatus() != null ? Expense.ExpenseStatus.valueOf(dto.getStatus()) : Expense.ExpenseStatus.PAID)
            .notes(dto.getNotes())
            .department(dto.getDepartment())
            .location(dto.getLocation())
            .attachments(dto.getAttachments())
            .createdBy(dto.getCreatedBy())
            .build();
    }
    
    private void updateExpenseFields(Expense expense, ExpenseDTO dto) {
        expense.setDate(dto.getDate());
        expense.setExpenseAccount(dto.getExpenseAccount());
        expense.setReferenceNumber(dto.getReferenceNumber());
        expense.setVendorId(dto.getVendorId());
        expense.setVendorName(dto.getVendorName());
        expense.setPaidThrough(dto.getPaidThrough());
        expense.setCustomerId(dto.getCustomerId());
        expense.setCustomerName(dto.getCustomerName());
        expense.setAmount(dto.getAmount());
        expense.setTaxInclusive(dto.getTaxInclusive());
        expense.setTax(dto.getTax());
        expense.setStatus(dto.getStatus() != null ? Expense.ExpenseStatus.valueOf(dto.getStatus()) : expense.getStatus());
        expense.setNotes(dto.getNotes());
        expense.setDepartment(dto.getDepartment());
        expense.setLocation(dto.getLocation());
        expense.setAttachments(dto.getAttachments());
    }
}