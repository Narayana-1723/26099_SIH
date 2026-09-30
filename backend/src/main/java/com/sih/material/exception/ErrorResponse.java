package com.sih.material.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    @Builder.Default
    private boolean success = false;

    private String message;
    private String errorCode;
    private Map<String, String> errors;

    @Builder.Default
    private Instant timestamp = Instant.now();
}
