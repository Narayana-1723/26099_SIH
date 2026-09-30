package com.sih.material.util;

import com.sih.material.exception.ValidationException;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

public class ValidationUtil {

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".csv", ".xlsx", ".xls", ".json");
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

    public static void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Uploaded file cannot be null or empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ValidationException("File size exceeds 50MB maximum limit.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.isBlank()) {
            throw new ValidationException("Invalid filename.");
        }

        // Prevent path traversal
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new ValidationException("Invalid filename containing path traversal characters.");
        }

        String lower = filename.toLowerCase();
        boolean validExtension = ALLOWED_EXTENSIONS.stream().anyMatch(lower::endsWith);
        if (!validExtension) {
            throw new ValidationException("Unsupported file type. Only CSV, XLSX, XLS, and JSON files are accepted.");
        }
    }

    public static String normalizeText(String input) {
        if (input == null) return "";
        return input.trim()
                .toLowerCase()
                .replaceAll("[\t\r\n]+", " ")
                .replaceAll(" +", " ");
    }
}
