package com.feed.feedv4.repository;

import com.feed.feedv4.model.Formulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FormulationRepository extends JpaRepository<Formulation, Long> {

    List<Formulation> findByFeedProfileId(Long feedProfileId);
    List<Formulation> findByTagsContaining(String tag);
    int countByCreatedAtAfter(java.time.LocalDateTime date);
    List<Formulation> findByStatusNot(String status);

    @Query("""
           select distinct f
           from Formulation f
           left join fetch f.ingredients i
           left join fetch i.rawMaterial rm
           left join fetch f.feedProfile fp
           where f.id = :id
           """)
    Optional<Formulation> findFullById(@Param("id") Long id);
}

