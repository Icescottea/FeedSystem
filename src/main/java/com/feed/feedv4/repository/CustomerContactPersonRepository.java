package com.feed.feedv4.repository;

import com.feed.feedv4.model.CustomerContactPerson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerContactPersonRepository extends JpaRepository<CustomerContactPerson, Long> {
    
    List<CustomerContactPerson> findByCustomerId(Long customerId);
    
    @Query("SELECT ccp FROM CustomerContactPerson ccp WHERE ccp.customer.id = :customerId ORDER BY ccp.sequence ASC")
    List<CustomerContactPerson> findByCustomerIdOrderBySequence(@Param("customerId") Long customerId);
    
    void deleteByCustomerId(Long customerId);
}