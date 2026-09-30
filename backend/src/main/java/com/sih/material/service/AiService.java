package com.sih.material.service;

import com.sih.material.exception.AiServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final WebClient mlWebClient;

    /**
     * Calls Python FastAPI /api/extract-attributes
     * Validates output before returning.
     */
    public Map<String, Object> extractAttributes(String materialCode, String description) {
        Map<String, String> payload = Map.of(
                "materialCode", materialCode != null ? materialCode : "",
                "description", description != null ? description : ""
        );

        try {
            Map<String, Object> response = mlWebClient.post()
                    .uri("/api/extract-attributes")
                    .bodyValue(payload)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .flatMap(errorBody -> Mono.error(new AiServiceException("ML Service attribute extraction error: " + errorBody))))
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .timeout(Duration.ofSeconds(15))
                    .block();

            return validateAndSanitizeAttributes(response);
        } catch (WebClientRequestException e) {
            log.error("ML service unreachable during attribute extraction: {}", e.getMessage());
            throw new AiServiceException("AI ML service is unavailable: " + e.getMessage(), e);
        } catch (WebClientResponseException e) {
            log.error("ML service HTTP error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new AiServiceException("AI ML service failed with HTTP status " + e.getStatusCode(), e);
        } catch (Exception e) {
            if (e instanceof AiServiceException) throw (AiServiceException) e;
            log.error("Unexpected error in AI attribute extraction: {}", e.getMessage());
            throw new AiServiceException("AI processing failed: " + e.getMessage(), e);
        }
    }

    /**
     * Calls Python FastAPI /api/embeddings
     */
    public List<Double> generateEmbeddings(String text) {
        Map<String, Object> payload = Map.of(
                "texts", List.of(text != null ? text : ""),
                "text", text != null ? text : ""
        );

        try {
            Map<String, Object> response = mlWebClient.post()
                    .uri("/api/embeddings")
                    .bodyValue(payload)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .flatMap(errorBody -> Mono.error(new AiServiceException("ML Service embedding error: " + errorBody))))
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .timeout(Duration.ofSeconds(15))
                    .block();

            if (response != null) {
                if (response.containsKey("embeddings")) {
                    Object embObj = response.get("embeddings");
                    if (embObj instanceof List<?> list && !list.isEmpty()) {
                        Object first = list.get(0);
                        if (first instanceof List<?>) {
                            @SuppressWarnings("unchecked")
                            List<Double> castList = (List<Double>) first;
                            return castList;
                        }
                    }
                }
                if (response.containsKey("embedding")) {
                    Object embObj = response.get("embedding");
                    if (embObj instanceof List<?>) {
                        @SuppressWarnings("unchecked")
                        List<Double> list = (List<Double>) embObj;
                        return list;
                    }
                }
            }
            return Collections.emptyList();
        } catch (WebClientRequestException e) {
            log.error("ML service unreachable during embedding generation: {}", e.getMessage());
            throw new AiServiceException("AI ML service is unavailable: " + e.getMessage(), e);
        } catch (Exception e) {
            if (e instanceof AiServiceException) throw (AiServiceException) e;
            log.error("Embedding generation failed: {}", e.getMessage());
            throw new AiServiceException("AI embedding generation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Calls Python FastAPI /api/match
     */
    public Map<String, Object> match(Map<String, Object> sourceMaterial, List<Map<String, Object>> candidates) {
        Map<String, Object> payload = Map.of(
                "sourceMaterial", sourceMaterial,
                "candidateMaterials", candidates,
                "source", sourceMaterial,
                "candidates", candidates
        );

        try {
            Map<String, Object> response = mlWebClient.post()
                    .uri("/api/match")
                    .bodyValue(payload)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .flatMap(errorBody -> Mono.error(new AiServiceException("ML Service matching error: " + errorBody))))
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (response == null) {
                throw new AiServiceException("ML Service returned an empty match response.");
            }
            return response;
        } catch (WebClientRequestException e) {
            log.error("ML service unreachable during matching: {}", e.getMessage());
            throw new AiServiceException("AI ML service is unavailable: " + e.getMessage(), e);
        } catch (Exception e) {
            if (e instanceof AiServiceException) throw (AiServiceException) e;
            log.error("AI matching failed: {}", e.getMessage());
            throw new AiServiceException("AI matching service failed: " + e.getMessage(), e);
        }
    }

    /**
     * Calls Python FastAPI /api/classify
     */
    public Map<String, Object> classify(String description) {
        Map<String, String> payload = Map.of("description", description != null ? description : "");

        try {
            return mlWebClient.post()
                    .uri("/api/classify")
                    .bodyValue(payload)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .flatMap(errorBody -> Mono.error(new AiServiceException("ML Service classify error: " + errorBody))))
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .timeout(Duration.ofSeconds(15))
                    .block();
        } catch (WebClientRequestException e) {
            log.error("ML service unreachable during classification: {}", e.getMessage());
            throw new AiServiceException("AI ML service is unavailable: " + e.getMessage(), e);
        } catch (Exception e) {
            if (e instanceof AiServiceException) throw (AiServiceException) e;
            log.error("Classification failed: {}", e.getMessage());
            throw new AiServiceException("AI classification failed: " + e.getMessage(), e);
        }
    }

    /**
     * Pings the Python ML service health endpoint for model and service status.
     */
    public Map<String, Object> checkModelStatus() {
        try {
            return mlWebClient.get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .block();
        } catch (Exception e) {
            try {
                return mlWebClient.get()
                        .uri("/api/health")
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                        .timeout(Duration.ofSeconds(5))
                        .block();
            } catch (Exception ex) {
                Map<String, Object> status = new HashMap<>();
                status.put("status", "DOWN");
                status.put("error", ex.getMessage());
                status.put("timestamp", System.currentTimeMillis());
                return status;
            }
        }
    }

    private Map<String, Object> validateAndSanitizeAttributes(Map<String, Object> response) {
        if (response == null) {
            return Collections.emptyMap();
        }
        Map<String, Object> sanitized = new HashMap<>();

        // If response has nested "attributes" map, unwrap attributes
        if (response.get("attributes") instanceof Map<?, ?> attrs) {
            for (Map.Entry<?, ?> entry : attrs.entrySet()) {
                if (entry.getKey() != null && entry.getValue() != null && !entry.getValue().toString().isBlank()) {
                    sanitized.put(entry.getKey().toString(), entry.getValue());
                }
            }
        }

        // Also keep top-level fields (excluding container metadata)
        for (Map.Entry<String, Object> entry : response.entrySet()) {
            if (!"attributes".equals(entry.getKey()) && !"confidenceScores".equals(entry.getKey())
                    && entry.getValue() != null && !entry.getValue().toString().isBlank()) {
                sanitized.putIfAbsent(entry.getKey(), entry.getValue());
            }
        }
        return sanitized;
    }
}
