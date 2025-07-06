package com.feed.feedv4.repository;

import com.feed.feedv4.model.FormulationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormulationLogRepository extends JpaRepository<FormulationLog, Long> {
    List<FormulationLog> findByFormulationIdOrderByTimestampDesc(Long formulationId);
}
