package com.feed.feedv4.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "factories",
       indexes = {
           @Index(name = "idx_factory_name", columnList = "name"),
           @Index(name = "idx_factory_registration", columnList = "registrationNumber", unique = true)
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Factory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 160)
    private String name;

    @Size(max = 100)
    private String registrationNumber; // unique-ish, indexed above

    @Size(max = 500)
    private String address;

    @Size(max = 50)
    private String contactNumber;

    @Email
    @Size(max = 160)
    private String email;

    @Size(max = 500)
    private String logoUrl; // e.g. /uploads/factories/{file}.png

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        final LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
