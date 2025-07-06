package com.feed.feedv4.service;

import com.feed.feedv4.model.Formulation;
import com.feed.feedv4.model.FormulationIngredient;
import com.feed.feedv4.model.FormulationLog;
import com.feed.feedv4.model.RawMaterial;
import com.feed.feedv4.repository.FormulationLogRepository;
import com.feed.feedv4.repository.FormulationRepository;
import com.feed.feedv4.repository.RawMaterialRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.Row;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.io.ByteArrayOutputStream;

@Service
public class FormulationService {

    private final FormulationRepository repository;
    @Autowired
    private RawMaterialRepository rawMaterialRepository;
    private FormulationLogRepository logRepository;

    public FormulationService(FormulationRepository repository) {
        this.repository = repository;
    }

    public List<Formulation> getAll() {
        return repository.findAll();
    }

    public Formulation getById(Long id) {
        return repository.findById(id).orElseThrow();
    }

    public Formulation save(Formulation formulation) {
        formulation.setCreatedAt(LocalDate.now());
        formulation.setUpdatedAt(LocalDate.now());
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
            existing.setUpdatedAt(LocalDate.now());

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

        Map<String, Double> newPercents = (Map<String, Double>) body.get("ingredientPercentages");
        List<String> lockedNames = (List<String>) body.get("lockedIngredients");
        boolean finalized = (boolean) body.getOrDefault("finalized", false);

        for (FormulationIngredient fi : formulation.getIngredients()) {
            if (fi.getRawMaterial() != null && fi.getRawMaterial().getName() != null) {
                String name = fi.getRawMaterial().getName();
                if (newPercents.containsKey(name)) {
                    fi.setPercentage(newPercents.get(name));
                    fi.setLocked(lockedNames != null && lockedNames.contains(name));
                }
            }
        }

        formulation.setFinalized(finalized);
        formulation.setUpdatedAt(LocalDate.now());
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
        Formulation f = getById(id);
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document();
            PdfWriter.getInstance(doc, out);
            doc.open();

            doc.add(new Paragraph("Formulation: " + f.getName()));
            doc.add(new Paragraph("Batch Size: " + f.getBatchSize()));
            doc.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(4);
            table.addCell("Ingredient");
            table.addCell("Percentage");
            table.addCell("Cost Per Kg");
            table.addCell("Contribution (kg)");

            for (FormulationIngredient fi : f.getIngredients()) {
                table.addCell(fi.getRawMaterial().getName());
                table.addCell(String.valueOf(fi.getPercentage()));
                table.addCell(String.valueOf(fi.getRawMaterial().getCostPerKg()));
                table.addCell(String.format("%.2f", (fi.getPercentage() * f.getBatchSize()) / 100.0));
            }

            doc.add(table);
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

}
