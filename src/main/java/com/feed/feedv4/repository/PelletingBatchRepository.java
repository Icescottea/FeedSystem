package com.feed.feedv4.repository;

import com.feed.feedv4.model.PelletingBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PelletingBatchRepository extends JpaRepository<PelletingBatch, Long> {
    List<PelletingBatch> findByOperatorId(Long operatorId);
    List<PelletingBatch> findByStatus(String status);
    List<PelletingBatch> findByArchivedFalse();
    List<PelletingBatch> findByStatusAndArchivedFalse(String status);
    int countByStatus(String status);
    @Query("""
      select b
      from PelletingBatch b
      join fetch b.formulation f
      left join fetch f.ingredients i
      left join fetch i.rawMaterial rm
      where b.id = :id
    """)
    Optional<PelletingBatch> findWithFormulationById(@Param("id") Long id);
}
