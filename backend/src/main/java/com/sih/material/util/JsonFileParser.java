package com.sih.material.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.material.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.*;

@Component
@RequiredArgsConstructor
public class JsonFileParser implements FileParser {

    private final ObjectMapper objectMapper;
    private static final List<String> CODE_KEYS = Arrays.asList("material_code", "materialcode", "code", "item_code", "part_number", "part_no", "material_no");
    private static final List<String> DESC_KEYS = Arrays.asList("description", "material_description", "item_description", "desc", "short_desc", "long_desc");

    @Override
    public boolean supports(String filename) {
        return filename != null && filename.toLowerCase().endsWith(".json");
    }

    @Override
    public List<ParsedRow> parse(InputStream inputStream) {
        List<ParsedRow> rows = new ArrayList<>();
        try {
            List<Map<String, Object>> records = objectMapper.readValue(inputStream, new TypeReference<>() {});
            if (records == null || records.isEmpty()) {
                throw new ValidationException("JSON file contains no material array records.");
            }

            int rowIdx = 0;
            for (Map<String, Object> record : records) {
                rowIdx++;
                String code = findValue(record, CODE_KEYS);
                String desc = findValue(record, DESC_KEYS);

                if (code == null || code.isBlank()) {
                    throw new ValidationException("Record " + rowIdx + ": Material code is missing.");
                }
                if (desc == null || desc.isBlank()) {
                    throw new ValidationException("Record " + rowIdx + ": Material description is missing.");
                }

                Map<String, String> attributes = new HashMap<>();
                for (Map.Entry<String, Object> entry : record.entrySet()) {
                    if (entry.getValue() != null && !isCodeOrDesc(entry.getKey())) {
                        attributes.put(entry.getKey(), entry.getValue().toString());
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
            throw new ValidationException("Failed to parse JSON file: " + e.getMessage());
        }

        return rows;
    }

    private String findValue(Map<String, Object> map, List<String> candidates) {
        for (String candidate : candidates) {
            for (Map.Entry<String, Object> entry : map.entrySet()) {
                if (entry.getKey().equalsIgnoreCase(candidate) || entry.getKey().toLowerCase().replace(" ", "_").equals(candidate)) {
                    return entry.getValue() != null ? entry.getValue().toString().trim() : null;
                }
            }
        }
        return null;
    }

    private boolean isCodeOrDesc(String key) {
        return CODE_KEYS.stream().anyMatch(c -> c.equalsIgnoreCase(key)) ||
               DESC_KEYS.stream().anyMatch(d -> d.equalsIgnoreCase(key));
    }
}
