package com.feed.feedv4.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormulationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp;
    private String action; // e.g., "Created", "Updated", "Finalized"
    private String message;

    @ManyToOne
    @JoinColumn(name = "formulation_id")
    private Formulation formulation;
}
