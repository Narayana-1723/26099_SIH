package com.sih.material.security;

import com.sih.material.entity.User;
import com.sih.material.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    private String adminToken;
    private String reviewerToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        User admin = userRepository.findByEmployeeId("ADM001").orElseGet(() ->
                userRepository.save(User.builder()
                        .employeeId("ADM001")
                        .name("Admin")
                        .email("admin@test.com")
                        .passwordHash("hash")
                        .role("ADMIN")
                        .active(true)
                        .build()));

        User reviewer = userRepository.findByEmployeeId("REV001").orElseGet(() ->
                userRepository.save(User.builder()
                        .employeeId("REV001")
                        .name("Reviewer")
                        .email("rev@test.com")
                        .passwordHash("hash")
                        .role("REVIEWER")
                        .active(true)
                        .build()));

        User user = userRepository.findByEmployeeId("USR001").orElseGet(() ->
                userRepository.save(User.builder()
                        .employeeId("USR001")
                        .name("User")
                        .email("usr@test.com")
                        .passwordHash("hash")
                        .role("USER")
                        .active(true)
                        .build()));

        adminToken = jwtService.generateToken(new SecurityUser(admin));
        reviewerToken = jwtService.generateToken(new SecurityUser(reviewer));
        userToken = jwtService.generateToken(new SecurityUser(user));
    }

    @Test
    void unauthenticatedRequest_ReturnsUnauthorizedOrForbidden() throws Exception {
        mockMvc.perform(get("/api/materials"))
                .andExpect(status().isForbidden());
    }

    @Test
    void invalidJwt_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/materials")
                .header("Authorization", "Bearer invalid-token-string"))
                .andExpect(status().isForbidden());
    }

    @Test
    void validJwt_AllowsAccessToMaterials() throws Exception {
        mockMvc.perform(get("/api/materials")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());
    }

    @Test
    void userRole_AccessingAdminEndpoint_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminRole_AccessingAdminEndpoint_Succeeds() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    void reviewerRole_AccessingReviewsEndpoint_Succeeds() throws Exception {
        mockMvc.perform(get("/api/reviews")
                .header("Authorization", "Bearer " + reviewerToken))
                .andExpect(status().isOk());
    }
}
