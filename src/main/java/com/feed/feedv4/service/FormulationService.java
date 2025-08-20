package com.feed.feedv4.service;

import com.feed.feedv4.dto.FormulationIngredientDTO;
import com.feed.feedv4.dto.FormulationResponse;
import com.feed.feedv4.model.FeedProfile;
import com.feed.feedv4.model.Formulation;
import com.feed.feedv4.model.FormulationIngredient;
import com.feed.feedv4.model.FormulationLog;
import com.feed.feedv4.model.PelletingBatch;
import com.feed.feedv4.model.RawMaterial;
import com.feed.feedv4.repository.FeedProfileRepository;
import com.feed.feedv4.repository.FormulationLogRepository;
import com.feed.feedv4.repository.FormulationRepository;
import com.feed.feedv4.repository.RawMaterialRepository;
import com.feed.feedv4.repository.PelletingBatchRepository;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.FontFactory;
import java.awt.Color;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.io.ByteArrayOutputStream;
import java.text.DecimalFormat;

@Service
public class FormulationService {

    private final FormulationRepository repository;
    private final RawMaterialRepository rawMaterialRepository;
    private final FormulationLogRepository logRepository;
    private final FeedProfileRepository feedProfileRepository;
    private final PelletingBatchRepository pelletingBatchRepository;

    private double computeCostPerKg(Formulation f) {
        if (f.getIngredients() == null || f.getIngredients().isEmpty() || f.getBatchSize() <= 0) return 0.0;
        double totalCost = 0.0;
        for (FormulationIngredient fi : f.getIngredients()) {
            Double pct = fi.getPercentage();
            double kg = (fi.getQuantityKg() != 0) ? fi.getQuantityKg()
                     : (pct != null ? (pct / 100.0) * f.getBatchSize() : 0.0);

            double rmCost = (fi.getCostPerKg() > 0) ? fi.getCostPerKg()
                           : (fi.getRawMaterial() != null && fi.getRawMaterial().getCostPerKg() != null)
                             ? fi.getRawMaterial().getCostPerKg() : 0.0;

            totalCost += kg * rmCost;
        }
        return totalCost / f.getBatchSize();
    }

    @Autowired
    public FormulationService(FormulationRepository repository, 
                            RawMaterialRepository rawMaterialRepository,
                            FeedProfileRepository feedProfileRepository,
                            FormulationLogRepository logRepository, 
                            PelletingBatchRepository pelletingBatchRepository) {
        this.repository = repository;
        this.rawMaterialRepository = rawMaterialRepository;
        this.feedProfileRepository = feedProfileRepository;
        this.logRepository = logRepository;
        this.pelletingBatchRepository = pelletingBatchRepository;
    }

    // ========================
    // NEW AUTO-GENERATION CORE
    // ========================
    
    @Transactional
    public FormulationResponse generateFormulation(Long profileId, double batchSize) {
        FeedProfile profile = feedProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Feed profile not found"));
        
        // Get mandatory/restricted ingredients using repository methods
        List<String> mandatory = feedProfileRepository.findMandatoryIngredients(profileId);
        List<String> restricted = feedProfileRepository.findRestrictedIngredients(profileId);
        
        // Handle null cases
        mandatory = mandatory != null ? mandatory : Collections.emptyList();
        restricted = restricted != null ? restricted : Collections.emptyList();
        
        // Generate optimal ingredient mix
        List<FormulationIngredient> ingredients = generateOptimalMix(profile, batchSize, mandatory, restricted);
        
        // Calculate metrics
        double costPerKg = calculateCostPerKg(ingredients);
        Map<String, Double> nutrients = calculateAchievedNutrients(ingredients, batchSize);
        
        return new FormulationResponse(
            profileId,
            batchSize,
            convertToIngredientDTOs(ingredients),
            costPerKg,
            nutrients
        );
    }

    private List<FormulationIngredient> generateOptimalMix(FeedProfile profile, double batchSize, 
                                                         List<String> mandatory, List<String> restricted) {
        // Get available materials (non-restricted, in stock)
        List<RawMaterial> available = rawMaterialRepository.findByInStockKgGreaterThanAndArchivedFalse(0)
                .stream()
                .filter(rm -> !restricted.contains(rm.getName()))
                .collect(Collectors.toList());
        
        Map<String, Double> requiredNutrients = calculateRequiredNutrients(profile, batchSize);
        Set<Long> usedMaterialIds = new HashSet<>();
        List<FormulationIngredient> ingredients = new ArrayList<>();
        
        // 1. Add mandatory ingredients first
        for (String name : mandatory) {
            RawMaterial rm = available.stream()
                .filter(m -> m.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Mandatory ingredient not found: " + name));

            if (!usedMaterialIds.contains(rm.getId())) {
                double quantity = calculateInitialQuantity(rm, requiredNutrients);
                ingredients.add(createIngredient(rm, quantity));
                usedMaterialIds.add(rm.getId());
                adjustRemainingNutrients(requiredNutrients, rm, quantity);
            }
        }
        
        // 2. Fill remaining needs with cost-optimized materials
        while (!requiredNutrientsMet(requiredNutrients)) {
            RawMaterial best = findBestMaterial(available, requiredNutrients);
            
            if (!usedMaterialIds.contains(best.getId())) {
                double quantity = calculateOptimalQuantity(best, requiredNutrients, batchSize);
                ingredients.add(createIngredient(best, quantity));
                usedMaterialIds.add(best.getId());
                adjustRemainingNutrients(requiredNutrients, best, quantity);
            } else {
                break; // Prevent infinite loop
            }
        }
        
        // 3. Normalize to 100% and calculate exact kg
        return normalizeQuantities(ingredients, batchSize);
    }

    // ========================
    // HELPER METHODS
    // ========================

    private double calculateOptimalQuantity(RawMaterial material, 
                                          Map<String, Double> remainingNutrients, 
                                          double batchSize) {
        // 1. Determine which nutrients this material can help fulfill
        Map<String, Double> relevantNutrients = new HashMap<>();
                                        
        if (remainingNutrients.getOrDefault("protein", 0.0) > 0 && material.getCp() > 0) {
            relevantNutrients.put("protein", material.getCp());
        }
        if (remainingNutrients.getOrDefault("fat", 0.0) > 0 && material.getFat() > 0) {
            relevantNutrients.put("fat", material.getFat());
        }
        // Add other nutrients as needed...

        // 2. If material doesn't help with remaining needs, use minimal amount
        if (relevantNutrients.isEmpty()) {
            return 0.01 * batchSize; // 1% of batch as fallback
        }

        // 3. Calculate maximum quantity based on most limiting nutrient
        double maxQuantity = Double.MAX_VALUE;

        for (Map.Entry<String, Double> entry : relevantNutrients.entrySet()) {
            String nutrient = entry.getKey();
            double materialContent = entry.getValue();
            double remainingNeed = remainingNutrients.get(nutrient);

            double possibleQuantity = (remainingNeed * 100) / materialContent;
            maxQuantity = Math.min(maxQuantity, possibleQuantity);
        }

        // 4. Ensure we don't exceed available stock
        double availableStock = material.getInStockKg();
        return Math.min(maxQuantity, availableStock);
    }
    
    private List<FormulationIngredientDTO> convertToIngredientDTOs(List<FormulationIngredient> ingredients) {
        return ingredients.stream()
            .map(ingredient -> {
                FormulationIngredientDTO dto = new FormulationIngredientDTO();
                dto.setMaterialId(ingredient.getRawMaterial().getId());
                dto.setName(ingredient.getRawMaterial().getName());
                dto.setPercentage(ingredient.getPercentage());
                dto.setQuantityKg(ingredient.getQuantityKg());
                return dto;
            })
            .collect(Collectors.toList());
    }

    private double calculateCostPerKg(List<FormulationIngredient> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            return 0.0;
        }

        double totalCost = ingredients.stream()
            .mapToDouble(ingredient -> {
                double quantityKg = ingredient.getQuantityKg();
                double costPerKg = ingredient.getRawMaterial().getCostPerKg();
                return quantityKg * costPerKg;
            })
            .sum();

        double totalWeight = ingredients.stream()
            .mapToDouble(FormulationIngredient::getQuantityKg)
            .sum();

        return totalWeight > 0 ? totalCost / totalWeight : 0.0;
    }

    private Map<String, Double> calculateAchievedNutrients(List<FormulationIngredient> ingredients, double batchSize) {
        Map<String, Double> nutrients = new HashMap<>();
        if (ingredients == null || ingredients.isEmpty() || batchSize <= 0) {
            return nutrients;
        }

        // Initialize nutrient totals
        double totalProtein = 0;
        double totalFat = 0;
        double totalFiber = 0;
        double totalCalcium = 0;
        // Add other nutrients as needed

        // Calculate absolute nutrient amounts from each ingredient
        for (FormulationIngredient ingredient : ingredients) {
            RawMaterial material = ingredient.getRawMaterial();
            double quantityKg = ingredient.getQuantityKg();

            totalProtein += material.getCp() * quantityKg / 100;
            totalFat += material.getFat() * quantityKg / 100;
            totalFiber += material.getFiber() * quantityKg / 100;
            totalCalcium += material.getCalcium() * quantityKg / 100;
            // Add other nutrients
        }

        // Convert to percentages of total batch
        nutrients.put("protein", (totalProtein / batchSize) * 100);
        nutrients.put("fat", (totalFat / batchSize) * 100);
        nutrients.put("fiber", (totalFiber / batchSize) * 100);
        nutrients.put("calcium", (totalCalcium / batchSize) * 100);
        // Add other nutrients

        return nutrients;
    }

    private double calculateInitialQuantity(RawMaterial material, Map<String, Double> requiredNutrients) {
        // For mandatory ingredients, use either:
        // 1. Fixed percentage (e.g., 5% of batch)
        // 2. Enough to meet minimum nutrient requirements

        // Simple implementation - use 5% of required protein as baseline
        double proteinNeeded = requiredNutrients.getOrDefault("protein", 0.0);
        double proteinContent = material.getCp();

        if (proteinContent <= 0) {
            return 0.0;
        }

        // Calculate quantity needed to contribute 5% of protein requirement
        return (0.05 * proteinNeeded) / (proteinContent / 100);
    }

    private void adjustRemainingNutrients(Map<String, Double> remainingNutrients, 
                                        RawMaterial material, 
                                        double quantityUsed) {
        // Reduce remaining needs based on what this material provides
        remainingNutrients.computeIfPresent("protein", (k, v) -> 
            v - (material.getCp() * quantityUsed / 100));
        remainingNutrients.computeIfPresent("fat", (k, v) -> 
            v - (material.getFat() * quantityUsed / 100));
        remainingNutrients.computeIfPresent("fiber", (k, v) -> 
            v - (material.getFiber() * quantityUsed / 100));
        remainingNutrients.computeIfPresent("calcium", (k, v) -> 
            v - (material.getCalcium() * quantityUsed / 100));
        // Adjust other nutrients as needed
    }

    private boolean requiredNutrientsMet(Map<String, Double> remainingNutrients) {
        // Consider nutrients met if within 1% of target
        return remainingNutrients.values().stream()
            .allMatch(value -> value <= 0.01);
    }

    private List<FormulationIngredient> normalizeQuantities(List<FormulationIngredient> ingredients, double batchSize) {
        if (ingredients == null || ingredients.isEmpty() || batchSize <= 0) {
            return ingredients;
        }

        // Calculate total quantity
        double totalQuantity = ingredients.stream()
            .mapToDouble(FormulationIngredient::getQuantityKg)
            .sum();

        // Normalize quantities and calculate percentages
        for (FormulationIngredient ingredient : ingredients) {
            double normalizedQty = (ingredient.getQuantityKg() / totalQuantity) * batchSize;
            ingredient.setQuantityKg(normalizedQty);
            ingredient.setPercentage((normalizedQty / batchSize) * 100);
        }

        return ingredients;
    }

    private Map<String, Double> calculateRequiredNutrients(FeedProfile profile, double batchSize) {
        Map<String, Double> needs = new HashMap<>();
        needs.put("protein", profile.getProtein() * batchSize / 100);
        needs.put("fat", profile.getFat() * batchSize / 100);
        needs.put("fiber", profile.getFiber() * batchSize / 100);
        needs.put("calcium", profile.getCalcium() * batchSize / 100);
        // Add other nutrients as needed
        return needs;
    }
    
    private RawMaterial findBestMaterial(List<RawMaterial> candidates, Map<String, Double> remainingNutrients) {
        return candidates.stream()
                .min(Comparator.comparingDouble(rm -> calculateCostEffectivenessScore(rm, remainingNutrients)))
                .orElseThrow(() -> new RuntimeException("No suitable materials found"));
    }
    
    private double calculateCostEffectivenessScore(RawMaterial rm, Map<String, Double> remainingNutrients) {
        // Simple cost/nutrient efficiency score (lower is better)
        double proteinContribution = rm.getCp() * remainingNutrients.getOrDefault("protein", 0.0);
        double costScore = rm.getCostPerKg() / (proteinContribution + 0.001); // Avoid division by zero
        return costScore;
    }
    
    private FormulationIngredient createIngredient(RawMaterial rm, double quantityKg) {
        FormulationIngredient fi = new FormulationIngredient();
        fi.setRawMaterial(rm);
        fi.setQuantityKg(quantityKg);
        fi.setPercentage(25.0); // Will be calculated during normalization
        return fi;
    }

    // ========================
    // UPDATED CRUD METHODS
    // ========================
    
    @Transactional
    public Formulation createFromGenerated(FormulationResponse generated, String name) {
        Formulation formulation = new Formulation();
        formulation.setName(name);
        formulation.setFeedProfile(feedProfileRepository.findById(generated.getProfileId()).orElseThrow());
        formulation.setBatchSize(generated.getBatchSize());
        formulation.setStatus("Draft");
        formulation.setVersion("v1.0");
        formulation.setCreatedAt(LocalDateTime.now());
        formulation.setFinalized(false);
        
        // Convert response ingredients to entity
        List<FormulationIngredient> ingredients = generated.getIngredients().stream()
                .map(resp -> {
                    FormulationIngredient fi = new FormulationIngredient();
                    fi.setRawMaterial(rawMaterialRepository.findById(resp.getMaterialId()).orElseThrow());
                    fi.setPercentage(resp.getPercentage());
                    fi.setQuantityKg(resp.getQuantityKg());
                    fi.setFormulation(formulation);
                    return fi;
                })
                .collect(Collectors.toList());
        
        formulation.setIngredients(ingredients);
        return repository.save(formulation);
    }

    public List<Formulation> getAllActive() {
        return repository.findByStatusNot("Archived");
    }

    public List<Formulation> getAll() {
        return repository.findAll(); // This includes archived
    }

    public Formulation getById(Long id) {
        return repository.findById(id).orElseThrow();
    }

    public Formulation save(Formulation formulation) {
        formulation.setCreatedAt(LocalDateTime.now());
        formulation.setUpdatedAt(LocalDateTime.now());
        if (formulation.getIngredients() != null) {
            formulation.getIngredients().forEach(i -> i.setFormulation(formulation));
        }
        return repository.save(formulation);
    }

    public Formulation update(Long id, Formulation updated) {
        return repository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setFeedProfile(updated.getFeedProfile());
            existing.setBatchSize(updated.getBatchSize());
            existing.setStrategy(updated.getStrategy());
            existing.setStatus(updated.getStatus());
            existing.setVersion(updated.getVersion());
            existing.setTags(updated.getTags());
            existing.setNotes(updated.getNotes());
            existing.setCostPerKg(updated.getCostPerKg());
            existing.setUpdatedAt(LocalDateTime.now());
            existing.setLocked(updated.isLocked());

            existing.getIngredients().clear();
            if (updated.getIngredients() != null) {
                updated.getIngredients().forEach(i -> {
                    i.setFormulation(existing);
                    existing.getIngredients().add(i);
                });
            }

            return repository.save(existing);
        }).orElseThrow();
    }

    public void delete(Long id) {
        if(pelletingBatchRepository.existsById(id)) {
            throw new IllegalStateException("Cannot delete formulation with active pelleting batches. Archive instead.");
        }
        repository.deleteById(id);
    }

    public void archive(Long id) {
        Formulation f = getById(id);
        f.setStatus("Archived");
        repository.save(f);
    }

    public void lock(Long id) {
        Formulation f = getById(id);
        f.setLocked(true);
        repository.save(f);
    }

    public void unlock(Long id) {
        Formulation f = getById(id);
        f.setLocked(false);
        repository.save(f);
    }

    @Transactional
    public void updateFormulation(Long id, Map<String, Object> body) {
        Formulation formulation = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formulation not found"));
    
        // --- Handle form fields from FormulationEditForm ---
        if (body.containsKey("name"))
            formulation.setName((String) body.get("name"));
    
        if (body.containsKey("version"))
            formulation.setVersion((String) body.get("version"));
    
        if (body.containsKey("notes"))
            formulation.setNotes((String) body.get("notes"));
    
        if (body.containsKey("tags")) {
            formulation.setTags((List<String>) body.get("tags"));
        }
    
        if (body.containsKey("locked"))
            formulation.setLocked((Boolean) body.get("locked"));
    
        // --- Handle ingredient updates ---
        if (body.containsKey("ingredientPercentages") && body.containsKey("lockedIngredients")) {
            Map<String, Double> newPercents = (Map<String, Double>) body.get("ingredientPercentages");
            List<String> lockedNames = (List<String>) body.get("lockedIngredients");
        
            for (FormulationIngredient fi : formulation.getIngredients()) {
                if (fi.getRawMaterial() != null && fi.getRawMaterial().getName() != null) {
                    String name = fi.getRawMaterial().getName();
                    if (newPercents.containsKey(name)) {
                        fi.setPercentage(newPercents.get(name));
                        fi.setLocked(lockedNames != null && lockedNames.contains(name));
                    }
                }
            }
        }
    
        // --- Finalization flags ---
        if (body.containsKey("finalized"))
            formulation.setFinalized((Boolean) body.get("finalized"));
    
        if (body.containsKey("status"))
            formulation.setStatus((String) body.get("status"));
    
        formulation.setUpdatedAt(LocalDateTime.now());
        repository.save(formulation);
    }

    public Map<String, List<RawMaterial>> suggestAlternatives(Long formulationId) {
        Formulation formulation = repository.findById(formulationId)
            .orElseThrow(() -> new RuntimeException("Formulation not found"));

        Map<String, List<RawMaterial>> suggestions = new HashMap<>();

        for (FormulationIngredient fi : formulation.getIngredients()) {
            RawMaterial current = fi.getRawMaterial();
            double cp = current.getCp();
            double me = current.getMe();

            List<RawMaterial> similar = rawMaterialRepository.findAll().stream()
                .filter(rm ->
                    !rm.getName().equals(current.getName()) &&
                    Math.abs(rm.getCp() - cp) <= 2 &&
                    Math.abs(rm.getMe() - me) <= 100 &&
                    rm.getCostPerKg() < current.getCostPerKg() &&
                    rm.getInStockKg() > 0
                )
                .limit(3)
                .collect(Collectors.toList());

            suggestions.put(current.getName(), similar);
        }

        return suggestions;
    }

    public byte[] exportToExcel(Long id) {
        Formulation f = getById(id);
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Formulation");

            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Ingredient");
            header.createCell(1).setCellValue("Percentage");
            header.createCell(2).setCellValue("Cost Per Kg");
            header.createCell(3).setCellValue("Contribution (kg)");

            int rowIdx = 1;
            for (FormulationIngredient fi : f.getIngredients()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(fi.getRawMaterial().getName());
                row.createCell(1).setCellValue(fi.getPercentage());
                row.createCell(2).setCellValue(fi.getRawMaterial().getCostPerKg());
                row.createCell(3).setCellValue((fi.getPercentage() * f.getBatchSize()) / 100.0);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Excel export failed", e);
        }
    }

    public byte[] exportToPDF(Long id) {
        Formulation f = getFullById(id);
        DecimalFormat n2 = new DecimalFormat("#,##0.00");

        // --- helpers ---
        java.util.function.Function<Double, String> fmt = v -> n2.format(v == null ? 0.0 : v);
        java.util.function.Function<String, PdfPCell> hcell = (text) -> {
            PdfPCell c = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            c.setHorizontalAlignment(Element.ALIGN_CENTER);
            c.setBackgroundColor(new Color(245, 245, 245));
            c.setPadding(6f);
            return c;
        };
        java.util.function.Function<String, PdfPCell> ccell = (text) -> {
            PdfPCell c = new PdfPCell(new Phrase(text == null ? "-" : text, FontFactory.getFont(FontFactory.HELVETICA, 9)));
            c.setPadding(5f);
            return c;
        };
        
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // ---------- Title ----------
            Paragraph title = new Paragraph("FeedV4 – Formulation Report",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);
            doc.add(Chunk.NEWLINE);

            // ---------- Header / Summary ----------
            PdfPTable summary = new PdfPTable(new float[]{30f, 70f});
            summary.setWidthPercentage(100);

            summary.addCell(hcell.apply("Formulation Name"));
            summary.addCell(ccell.apply(f.getName()));

            summary.addCell(hcell.apply("Version"));
            summary.addCell(ccell.apply(f.getVersion() != null ? f.getVersion() : "-"));

            summary.addCell(hcell.apply("Status"));
            summary.addCell(ccell.apply(f.getStatus() != null ? f.getStatus() : "-"));

            summary.addCell(hcell.apply("Batch Size (kg)"));
            summary.addCell(ccell.apply(fmt.apply(f.getBatchSize())));

            summary.addCell(hcell.apply("Cost / kg (formulation)"));
            summary.addCell(ccell.apply("LKR " + fmt.apply(f.getCostPerKg())));

            if (f.getStrategy() != null && !f.getStrategy().isBlank()) {
                summary.addCell(hcell.apply("Strategy"));
                summary.addCell(ccell.apply(f.getStrategy()));
            }
            if (f.getNotes() != null && !f.getNotes().isBlank()) {
                summary.addCell(hcell.apply("Notes"));
                summary.addCell(ccell.apply(f.getNotes()));
            }

            doc.add(summary);
            doc.add(Chunk.NEWLINE);

            // ---------- Recipe Table ----------
            PdfPTable table = new PdfPTable(new float[]{34f, 12f, 16f, 18f, 20f});
            table.setWidthPercentage(100);

            table.addCell(hcell.apply("Ingredient"));
            table.addCell(hcell.apply("% Incl."));
            table.addCell(hcell.apply("Kg (batch)"));
            table.addCell(hcell.apply("Cost / kg (LKR)"));
            table.addCell(hcell.apply("Total Cost (LKR)"));

            double totalKg = 0.0;
            double totalCost = 0.0;

            if (f.getIngredients() != null) {
                for (FormulationIngredient fi : f.getIngredients()) {
                    // Resolve display name
                    String ingName =
                        (fi.getRawMaterial() != null && fi.getRawMaterial().getName() != null)
                            ? fi.getRawMaterial().getName()
                            : (fi.getRawMaterialName() != null ? fi.getRawMaterialName() : "—");

                    // Percentage (prefer explicit percentage, else derive from quantity)
                    Double pct = fi.getPercentage();
                    if (pct == null && f.getBatchSize() > 0 && fi.getQuantityKg() > 0) {
                        pct = (fi.getQuantityKg() / f.getBatchSize()) * 100.0;
                    }
                    if (pct == null) pct = 0.0;

                    // Kg contribution (prefer quantityKg; else compute from %)
                    double kg = (fi.getQuantityKg() > 0)
                            ? fi.getQuantityKg()
                            : ((pct * f.getBatchSize()) / 100.0);

                    // Cost per kg (prefer ingredient override; else from raw material; else 0)
                    double costPerKg = 0.0;
                    if (fi.getCostPerKg() > 0) {
                        costPerKg = fi.getCostPerKg();
                    } else if (fi.getRawMaterial() != null && fi.getRawMaterial().getCostPerKg() != null) {
                        costPerKg = fi.getRawMaterial().getCostPerKg();
                    }

                    double lineCost = kg * costPerKg;

                    totalKg += kg;
                    totalCost += lineCost;

                    table.addCell(ccell.apply(ingName));
                    table.addCell(ccell.apply(fmt.apply(pct)));
                    table.addCell(ccell.apply(fmt.apply(kg)));
                    table.addCell(ccell.apply(fmt.apply(costPerKg)));
                    table.addCell(ccell.apply(fmt.apply(lineCost)));
                }
            }

            // Totals row
            PdfPCell totLabel = new PdfPCell(new Phrase("Totals",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            totLabel.setColspan(2);
            totLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totLabel.setBackgroundColor(new Color(245, 245, 245));
            totLabel.setPadding(6f);
            table.addCell(totLabel);

            PdfPCell totKg = new PdfPCell(new Phrase(fmt.apply(totalKg),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            totKg.setHorizontalAlignment(Element.ALIGN_LEFT);
            totKg.setBackgroundColor(new Color(245, 245, 245));
            totKg.setPadding(6f);
            table.addCell(totKg);

            // empty cell under Cost/kg column in totals
            PdfPCell blank = new PdfPCell(new Phrase(" "));
            blank.setBackgroundColor(new Color(245, 245, 245));
            blank.setPadding(6f);
            table.addCell(blank);

            PdfPCell totCost = new PdfPCell(new Phrase(fmt.apply(totalCost),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            totCost.setHorizontalAlignment(Element.ALIGN_LEFT);
            totCost.setBackgroundColor(new Color(245, 245, 245));
            totCost.setPadding(6f);
            table.addCell(totCost);

            doc.add(table);
            doc.add(Chunk.NEWLINE);

            // ---------- Cost Summary (computed) ----------
            PdfPTable cs = new PdfPTable(new float[]{50f, 50f});
            cs.setWidthPercentage(60);
            cs.setHorizontalAlignment(Element.ALIGN_LEFT);

            double computedCostPerKg = (f.getBatchSize() > 0) ? (totalCost / f.getBatchSize()) : 0.0;

            cs.addCell(hcell.apply("Computed Cost / kg"));
            cs.addCell(ccell.apply("LKR " + fmt.apply(computedCostPerKg)));

            cs.addCell(hcell.apply("Total Batch Cost"));
            cs.addCell(ccell.apply("LKR " + fmt.apply(totalCost)));

            doc.add(cs);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF export failed", e);
        }
    }

    public void unarchive(Long id) {
        Formulation f = getById(id);
        f.setStatus("Draft");
        repository.save(f);
    }

    public void unfinalize(Long id) {
        Formulation f = getById(id);
        f.setFinalized(false);
        repository.save(f);
    }

    private void logAction(Formulation f, String action, String message) {
        FormulationLog log = new FormulationLog();
        log.setFormulation(f);
        log.setAction(action);
        log.setMessage(message);
        log.setTimestamp(LocalDateTime.now());
        logRepository.save(log);
    }

    public void finalize(Long id) {
        Formulation f = getById(id);
        f.setFinalized(true);
        f.setStatus("Finalized");
        f.setUpdatedAt(LocalDateTime.now());
        f.setCostPerKg(computeCostPerKg(getFullById(id)));
        repository.save(f);
        
        logAction(f, "FINALIZED", "Formulation marked as finalized");
        
        // 🚀 Auto-create PelletingBatch
        PelletingBatch pelletingBatch = PelletingBatch.builder()
            .formulation(f)
            .targetQuantityKg(f.getBatchSize()) // Replace with actual field if different
            .status("Not Started")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        pelletingBatchRepository.save(pelletingBatch);
    }

    @Transactional(readOnly = true)
    public Formulation getFullById(Long id) {
        return repository.findFullById(id)
            .orElseThrow(() -> new RuntimeException("Formulation not found"));
    }

}
