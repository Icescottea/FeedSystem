package com.feed.feedv4.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.feed.feedv4.model.Customer;
import com.feed.feedv4.model.Customer.CustomerStatus;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    Optional<Customer> findByEmail(String email);
    
    Optional<Customer> findByCustomerName(String customerName);
    
    List<Customer> findByStatus(CustomerStatus status);
    
    @Query("SELECT c FROM Customer c WHERE " +
           "LOWER(c.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.phone) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Customer> searchCustomers(@Param("search") String search);
    
    @Query("SELECT c FROM Customer c WHERE c.status = 'ACTIVE'")
    List<Customer> findAllActive();
    
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.status = :status")
    Long countByStatus(@Param("status") CustomerStatus status);
    
    boolean existsByEmail(String email);
    
    boolean existsByGstNumber(String gstNumber);
    
    List<Customer> findByDepartment(String department);
    
    List<Customer> findByLocation(String location);
}