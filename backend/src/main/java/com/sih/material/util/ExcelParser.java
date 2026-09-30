package com.sih.material.util;

import com.sih.material.exception.ValidationException;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.*;

@Component
public class ExcelParser implements FileParser {

    private static final List<String> CODE_HEADERS = Arrays.asList("material_code", "materialcode", "code", "item_code", "part_number", "part_no", "material_no");
    private static final List<String> DESC_HEADERS = Arrays.asList("description", "material_description", "item_description", "desc", "short_desc", "long_desc");

    @Override
    public boolean supports(String filename) {
        if (filename == null) return false;
        String lower = filename.toLowerCase();
        return lower.endsWith(".xlsx") || lower.endsWith(".xls");
    }

    @Override
    public List<ParsedRow> parse(InputStream inputStream) {
        List<ParsedRow> rows = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();

        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                throw new ValidationException("Excel sheet is empty.");
            }

            Iterator<Row> rowIterator = sheet.iterator();
            if (!rowIterator.hasNext()) {
                throw new ValidationException("Excel file contains no rows.");
            }

            // Header row
            Row headerRow = rowIterator.next();
            Map<Integer, String> headerMap = new HashMap<>();
            for (Cell cell : headerRow) {
                String val = formatter.formatCellValue(cell).trim();
                if (!val.isBlank()) {
                    headerMap.put(cell.getColumnIndex(), val);
                }
            }

            if (headerMap.isEmpty()) {
                throw new ValidationException("Excel header row is empty.");
            }

            Integer codeColIdx = findColumnIndex(headerMap, CODE_HEADERS);
            Integer descColIdx = findColumnIndex(headerMap, DESC_HEADERS);

            if (codeColIdx == null || descColIdx == null) {
                throw new ValidationException(
                        "Excel file is missing required columns. Must contain material code column (e.g. 'material_code', 'code') " +
                        "and description column (e.g. 'description', 'material_description'). Found headers: " + headerMap.values());
            }

            int rowIdx = 1;
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                rowIdx++;

                Cell codeCell = row.getCell(codeColIdx);
                Cell descCell = row.getCell(descColIdx);

                String code = codeCell != null ? formatter.formatCellValue(codeCell).trim() : "";
                String desc = descCell != null ? formatter.formatCellValue(descCell).trim() : "";

                if (code.isBlank() && desc.isBlank()) {
                    continue; // Skip empty row
                }

                if (code.isBlank()) {
                    throw new ValidationException("Row " + rowIdx + ": Material code is missing.");
                }
                if (desc.isBlank()) {
                    throw new ValidationException("Row " + rowIdx + ": Material description is missing.");
                }

                Map<String, String> attributes = new HashMap<>();
                for (Map.Entry<Integer, String> entry : headerMap.entrySet()) {
                    int col = entry.getKey();
                    if (col != codeColIdx && col != descColIdx) {
                        Cell attrCell = row.getCell(col);
                        if (attrCell != null) {
                            String attrVal = formatter.formatCellValue(attrCell).trim();
                            if (!attrVal.isBlank()) {
                                attributes.put(entry.getValue(), attrVal);
                            }
                        }
                    }
                }

                rows.add(ParsedRow.builder()
                        .rowNumber(rowIdx)
                        .materialCode(code)
                        .description(desc)
                        .attributes(attributes)
                        .build());
            }

        } catch (ValidationException ve) {
            throw ve;
        } catch (Exception e) {
            throw new ValidationException("Failed to parse Excel file: " + e.getMessage());
        }

        if (rows.isEmpty()) {
            throw new ValidationException("Excel file does not contain any valid material rows.");
        }

        return rows;
    }

    private Integer findColumnIndex(Map<Integer, String> headerMap, List<String> candidates) {
        for (String candidate : candidates) {
            for (Map.Entry<Integer, String> entry : headerMap.entrySet()) {
                String header = entry.getValue();
                if (header.equalsIgnoreCase(candidate) || header.toLowerCase().replace(" ", "_").equals(candidate)) {
                    return entry.getKey();
                }
            }
        }
        return null;
    }
}
