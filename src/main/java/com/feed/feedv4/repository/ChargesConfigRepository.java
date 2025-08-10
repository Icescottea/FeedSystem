package com.feed.feedv4.repository;

import com.feed.feedv4.model.ChargesConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChargesConfigRepository extends JpaRepository<ChargesConfig, Long> {

    // Latest active, non-archived by UPDATED time
    Optional<ChargesConfig> findTopByActiveTrueAndArchivedFalseOrderByUpdatedAtDesc();

    // Fallback if updatedAt is null on older rows → order by CREATED time
    Optional<ChargesConfig> findTopByActiveTrueAndArchivedFalseOrderByCreatedAtDesc();
}
