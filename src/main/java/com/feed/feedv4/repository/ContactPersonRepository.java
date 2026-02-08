package com.feed.feedv4.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.feed.feedv4.model.ContactPerson;

@Repository
public interface ContactPersonRepository extends JpaRepository<ContactPerson, Long> {
    
    List<ContactPerson> findByVendorId(Long vendorId);
    
    @Query("SELECT cp FROM ContactPerson cp WHERE cp.vendor.id = :vendorId ORDER BY cp.sequence ASC")
    List<ContactPerson> findByVendorIdOrderBySequence(@Param("vendorId") Long vendorId);
    
    void deleteByVendorId(Long vendorId);
}