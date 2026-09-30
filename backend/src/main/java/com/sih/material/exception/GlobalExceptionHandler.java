package com.sih.material.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode("RESOURCE_NOT_FOUND")
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(ValidationException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode("VALIDATION_ERROR")
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .message("Request validation failed")
                .errorCode("VALIDATION_FAILED")
                .errors(fieldErrors)
                .timestamp(Instant.now())
                .build();
        log.debug("Request validation failed: {}", fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        boolean matchResultId = "matchResultId".equals(ex.getName());
        String message = matchResultId
                ? "Invalid matchResultId. Use the numeric ID returned by POST /api/harmonization/match; this route expects a match-result ID, not a material ID."
                : "A request parameter has an invalid value.";
        String detail = matchResultId
                ? "Expected a positive numeric harmonization match-result ID; material IDs are not accepted."
                : "Expected value type: " + (ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "valid value");

        log.warn("Rejected request parameter '{}' with value '{}' (expected {})",
                ex.getName(), safeLogValue(ex.getValue()),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "valid value");

        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .message(message)
                .errorCode("INVALID_PARAMETER")
                .errors(Map.of(ex.getName(), detail))
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        Throwable cause = ex.getMostSpecificCause();
        log.warn("Rejected unreadable request body: {}", cause != null ? cause.getMessage() : ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .message("Request body is malformed or contains a value with the wrong type.")
                .errorCode("INVALID_REQUEST_BODY")
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler({UnauthorizedException.class, BadCredentialsException.class})
    public ResponseEntity<ErrorResponse> handleUnauthorized(Exception ex) {
        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode("UNAUTHORIZED")
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler({ForbiddenException.class, AccessDeniedException.class})
    public ResponseEntity<ErrorResponse> handleForbidden(Exception ex) {
        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .message(ex.getMessage() != null ? ex.getMessage() : "Access is denied")
                .errorCode("FORBIDDEN")
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(AiServiceException.class)
    public ResponseEntity<ErrorResponse> handleAiServiceException(AiServiceException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode("AI_SERVICE_UNAVAILABLE")
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .message("Uploaded file exceeds the maximum allowed size of 50MB")
                .errorCode("FILE_TOO_LARGE")
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode("BAD_REQUEST")
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        log.error("Unhandled server exception while processing request", ex);
        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .message("An unexpected internal error occurred. Please try again later.")
                .errorCode("INTERNAL_SERVER_ERROR")
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    private String safeLogValue(Object value) {
        if (value == null) return "null";
        String sanitized = String.valueOf(value).replaceAll("[\\r\\n\\t]", "_");
        return sanitized.length() > 80 ? sanitized.substring(0, 80) : sanitized;
    }
}
