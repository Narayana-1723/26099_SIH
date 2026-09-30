package com.sih.material.util;

import com.sih.material.exception.ValidationException;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class CsvParser implements FileParser {

    private static final List<String> CODE_HEADERS = Arrays.asList("material_code", "materialcode", "original_code", "original_material_code", "code", "item_code", "part_number", "part_no", "material_no");
    private static final List<String> DESC_HEADERS = Arrays.asList("description", "material_description", "item_description", "desc", "short_desc", "long_desc");

    @Override
    public boolean supports(String filename) {
        return filename != null && filename.toLowerCase().endsWith(".csv");
    }

    @Override
    public List<ParsedRow> parse(InputStream inputStream) {
        List<ParsedRow> rows = new ArrayList<>();
        try (InputStreamReader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
             CSVParser csvParser = CSVFormat.DEFAULT
                     .builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true)
                     .setTrim(true)
                     .build()
                     .parse(reader)) {

            Map<String, Integer> headerMap = csvParser.getHeaderMap();
            if (headerMap == null || headerMap.isEmpty()) {
                throw new ValidationException("CSV file contains no header record.");
            }

            String codeHeader = findMatchingHeader(headerMap.keySet(), CODE_HEADERS);
            String descHeader = findMatchingHeader(headerMap.keySet(), DESC_HEADERS);

            if (codeHeader == null || descHeader == null) {
                throw new ValidationException(
                        "CSV file is missing required columns. Must contain material code column (e.g. 'material_code', 'code') " +
                        "and description column (e.g. 'description', 'material_description'). Found headers: " + headerMap.keySet());
            }

            int rowIdx = 1;
            for (CSVRecord record : csvParser) {
                rowIdx++;
                String code = record.get(codeHeader);
                String desc = record.get(descHeader);

                // Skip blank rows
                if ((code == null || code.isBlank()) && (desc == null || desc.isBlank())) {
                    continue;
                }

                if (code == null || code.isBlank()) {
                    throw new ValidationException("Row " + rowIdx + ": Material code is missing.");
                }
                if (desc == null || desc.isBlank()) {
                    throw new ValidationException("Row " + rowIdx + ": Material description is missing.");
                }

                Map<String, String> attributes = new HashMap<>();
                for (String h : headerMap.keySet()) {
                    if (!h.equalsIgnoreCase(codeHeader) && !h.equalsIgnoreCase(descHeader)) {
                        String val = record.get(h);
                        if (val != null && !val.isBlank()) {
                            attributes.put(h, val.trim());
                        }
                    }
                }

                rows.add(ParsedRow.builder()
                        .rowNumber(rowIdx)
                        .materialCode(code.trim())
                        .description(desc.trim())
                        .attributes(attributes)
                        .build());
            }

        } catch (ValidationException ve) {
            throw ve;
        } catch (Exception e) {
            throw new ValidationException("Failed to parse CSV file: " + e.getMessage());
        }

        if (rows.isEmpty()) {
            throw new ValidationException("File does not contain any valid material rows.");
        }

        return rows;
    }

    private String findMatchingHeader(Set<String> headers, List<String> candidates) {
        for (String candidate : candidates) {
            for (String header : headers) {
                // CSVs exported by Excel and several catalog systems include a UTF-8 BOM.
                // Commons CSV keeps it in the first header name, so normalize it away
                // before matching required columns.
                String normalizedHeader = header.replace("\uFEFF", "").trim();
                if (normalizedHeader.equalsIgnoreCase(candidate)
                        || normalizedHeader.toLowerCase(Locale.ROOT).replace(" ", "_").equals(candidate)) {
                    return header;
                }
            }
        }
        return null;
    }
}
