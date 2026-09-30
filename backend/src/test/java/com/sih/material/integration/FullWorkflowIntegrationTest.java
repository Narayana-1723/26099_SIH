package com.sih.material.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.material.dto.auth.LoginRequest;
import com.sih.material.dto.canonical.CanonicalCreateRequest;
import com.sih.material.dto.harmonization.HarmonizationMatchRequest;
import com.sih.material.dto.material.MaterialCreateRequest;
import com.sih.material.dto.review.ReviewApproveRequest;
import com.sih.material.entity.Cpse;
import com.sih.material.repository.CpseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FullWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CpseRepository cpseRepository;

    private Long cpseId;

    @BeforeEach
    void setUp() {
        Cpse cpse = cpseRepository.findByCode("ONGC").orElseGet(() ->
                cpseRepository.save(Cpse.builder()
                        .name("Oil and Natural Gas Corporation")
                        .code("ONGC")
                        .description("Petroleum exploration")
                        .active(true)
                        .build()));
        cpseId = cpse.getId();
    }

    @Test
    void testEndToEndHarmonizationWorkflow() throws Exception {
        // Step 1: Login
        LoginRequest loginReq = new LoginRequest("ADM001", "password");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.user.employeeId").value("ADM001"))
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("data").get("token").asText();
        String authHeader = "Bearer " + token;

        // Step 2: GET /api/auth/me
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.employeeId").value("ADM001"));

        // Step 3: Create Canonical Material
        CanonicalCreateRequest canonicalReq = CanonicalCreateRequest.builder()
                .canonicalCode("CM-TEST-100")
                .standardName("Stainless Steel 316 Hex Bolt M16 x 50 mm")
                .category("Fasteners")
                .description("Standard metric bolt")
                .status("ACTIVE")
                .build();

        MvcResult canonResult = mockMvc.perform(post("/api/canonical-materials")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(canonicalReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.canonicalCode").value("CM-TEST-100"))
                .andReturn();

        Long canonicalId = objectMapper.readTree(canonResult.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // Step 4: Upload CSV File
        String csvContent = "material_code,description\n" +
                "BOLT-TEST-001,Hex Bolt M16x50 Stainless Steel 316\n" +
                "NUT-TEST-002,Hex Nut M16 Stainless Steel 316\n";

        MockMultipartFile csvFile = new MockMultipartFile(
                "file",
                "test_materials.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/materials/upload")
                        .file(csvFile)
                        .param("cpseId", cpseId.toString())
                        .header("Authorization", authHeader))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.data.jobId").isNotEmpty())
                .andExpect(jsonPath("$.data.status").value("QUEUED"))
                .andReturn();

        String jobId = objectMapper.readTree(uploadResult.getResponse().getContentAsString())
                .get("data").get("jobId").asText();

        // Step 5: Check Job Progress
        mockMvc.perform(get("/api/jobs/" + jobId)
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.jobId").value(jobId));

        // Step 6: Create Material manually to perform targeted match
        MaterialCreateRequest matReq = MaterialCreateRequest.builder()
                .cpseId(cpseId)
                .originalMaterialCode("FLOW-BOLT-M16")
                .originalDescription("HEXAGONAL BOLT SS316 M16 X 50 MM")
                .category("Fasteners")
                .itemType("Hex Bolt")
                .material("Stainless Steel")
                .grade("316")
                .diameter("M16")
                .length("50 mm")
                .build();

        MvcResult matResult = mockMvc.perform(post("/api/materials")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(matReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.originalMaterialCode").value("FLOW-BOLT-M16"))
                .andReturn();

        Long matId = objectMapper.readTree(matResult.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // Step 7: Search Materials
        mockMvc.perform(get("/api/materials/search")
                        .param("query", "FLOW-BOLT")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        // Step 8: Trigger Harmonization Matching
        HarmonizationMatchRequest matchReq = HarmonizationMatchRequest.builder()
                .materialId(matId)
                .canonicalMaterialId(canonicalId)
                .build();

        MvcResult matchResult = mockMvc.perform(post("/api/harmonization/match")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(matchReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.finalConfidence").isNumber())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andReturn();

        Long matchId = objectMapper.readTree(matchResult.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // Step 9: Human Review - Approve Match
        ReviewApproveRequest approveReq = new ReviewApproveRequest("Verified and approved engineering equivalence", canonicalId);

        mockMvc.perform(post("/api/reviews/" + matchId + "/approve")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approveReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.decision").value("APPROVE"));

        // Step 10: Verify Material is now HARMONIZED
        mockMvc.perform(get("/api/materials/" + matId)
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("HARMONIZED"));

        // Step 11: Verify Analytics reflect the harmonized count
        mockMvc.perform(get("/api/analytics/overview")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.harmonizedMaterials", greaterThanOrEqualTo(1)));

        // Step 12: Verify Admin Audit Log
        mockMvc.perform(get("/api/admin/audit-logs")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }
}
