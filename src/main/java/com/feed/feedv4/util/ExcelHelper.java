package com.feed.feedv4.util;

import com.feed.feedv4.model.RawMaterial;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Component
public class ExcelHelper {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public List<RawMaterial> parseExcel(InputStream is) {
        List<RawMaterial> list = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            boolean firstRow = true;
            while (rows.hasNext()) {
                Row row = rows.next();
                if (firstRow) {
                    firstRow = false;
                    continue;
                }

                RawMaterial rm = new RawMaterial();

                rm.setName(getCellString(row, 0));
                rm.setType(getCellString(row, 1));
                rm.setCostPerKg(getCellDouble(row, 2));
                rm.setInStockKg(getCellDouble(row, 3));

                // Handle date (as text or date cell)
                Cell dateCell = row.getCell(4);
                if (dateCell.getCellType() == CellType.NUMERIC) {
                    rm.setExpiryDate(dateCell.getLocalDateTimeCellValue().toLocalDate());
                } else {
                    rm.setExpiryDate(LocalDate.parse(getCellString(row, 4), DATE_FORMATTER));
                }

                rm.setSupplier(getCellString(row, 5));
                rm.setBatchId(getCellString(row, 6));
                rm.setQualityGrade(getCellString(row, 7));
                rm.setCp(getCellDouble(row, 8));
                rm.setMe(getCellDouble(row, 9));
                rm.setCalcium(getCellDouble(row, 10));
                rm.setFat(getCellDouble(row, 11));
                rm.setFiber(getCellDouble(row, 12));
                rm.setAsh(getCellDouble(row, 13));

                // Default values
                rm.setLocked(false);
                rm.setArchived(false);

                list.add(rm);
            }
        } catch (Exception e) {
            throw new RuntimeException("❌ Excel parsing error: " + e.getMessage(), e);
        }

        return list;
    }

    private String getCellString(Row row, int idx) {
        Cell cell = row.getCell(idx);
        return (cell != null) ? cell.toString().trim() : "";
    }

    private double getCellDouble(Row row, int idx) {
        Cell cell = row.getCell(idx);
        return (cell != null && cell.getCellType() == CellType.NUMERIC)
            ? cell.getNumericCellValue()
            : Double.parseDouble(cell.toString());
    }
}
