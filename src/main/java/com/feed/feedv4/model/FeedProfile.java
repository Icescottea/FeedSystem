package com.feed.feedv4.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "feed_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String feedName;

    private String species;     // e.g., Poultry, Fish, Goat, Cow
    private String stage;       // e.g., Starter, Grower, Finisher, Lactating

    // Nutrient Targets
    private Double protein;     // in %
    private Double energy;      // in kcal/kg
    private Double calcium;
    private Double phosphorus;
    private Double fiber;
    private Double fat;
    private Double methionine;
    private Double lysine;

    // Limitations
    private Double maxSalt;
    private Double maxFiber;

    // Ingredients
    @ElementCollection
    private List<String> mandatoryIngredients;

    @ElementCollection
    private List<String> restrictedIngredients;

    // Preference Strategy: COST_EFFECTIVE, BALANCED, HIGH_QUALITY
    private String preferenceStrategy;

    @ElementCollection
    private List<String> tags; // e.g., “Summer Poultry”, “For Organic Use”

    private boolean archived = false;
    private boolean locked = false;
}
