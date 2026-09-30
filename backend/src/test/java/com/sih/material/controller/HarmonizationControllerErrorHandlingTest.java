package com.sih.material.controller;

import com.sih.material.exception.GlobalExceptionHandler;
import com.sih.material.service.HarmonizationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

class HarmonizationControllerErrorHandlingTest {

    private LocalValidatorFactoryBean validator;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        mockMvc = standaloneSetup(new HarmonizationController(mock(HarmonizationService.class)))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();
    }

    @AfterEach
    void tearDown() {
        validator.close();
    }

    @Test
    void nonNumericMatchResultIdReturnsClearBadRequest() throws Exception {
        mockMvc.perform(get("/api/harmonization/mat-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("INVALID_PARAMETER"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("match-result ID, not a material ID")))
                .andExpect(jsonPath("$.errors.matchResultId").exists());
    }

    @Test
    void matchRequestRequiresMaterialId() throws Exception {
        mockMvc.perform(post("/api/harmonization/match")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors.materialId").value("Material ID is required"));
    }

    @Test
    void nonPositiveMaterialIdReturnsValidationError() throws Exception {
        mockMvc.perform(post("/api/harmonization/match")
                        .contentType("application/json")
                        .content("{\"materialId\":0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors.materialId").value("Material ID must be a positive numeric ID"));
    }

    @Test
    void nonNumericMaterialIdInMatchBodyReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/harmonization/match")
                        .contentType("application/json")
                        .content("{\"materialId\":\"mat-1\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("INVALID_REQUEST_BODY"))
                .andExpect(jsonPath("$.message").value("Request body is malformed or contains a value with the wrong type."));
    }
}
