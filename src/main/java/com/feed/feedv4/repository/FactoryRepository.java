package com.feed.feedv4.repository;

import com.feed.feedv4.model.Factory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FactoryRepository extends JpaRepository<Factory, Long> {

    // Lightweight search
    List<Factory> findByNameContainingIgnoreCase(String q);

    // Registration helpers (to enforce uniqueness in service)
    Optional<Factory> findByRegistrationNumberIgnoreCase(String registrationNumber);
    boolean existsByRegistrationNumberIgnoreCase(String registrationNumber);
}
