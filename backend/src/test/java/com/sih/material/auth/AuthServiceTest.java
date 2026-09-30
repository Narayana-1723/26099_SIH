package com.sih.material.auth;

import com.sih.material.dto.auth.AuthResponse;
import com.sih.material.dto.auth.LoginRequest;
import com.sih.material.entity.User;
import com.sih.material.exception.UnauthorizedException;
import com.sih.material.repository.UserRepository;
import com.sih.material.security.JwtService;
import com.sih.material.security.SecurityUser;
import com.sih.material.service.AuditService;
import com.sih.material.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.sih.material.repository.CpseRepository cpseRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .employeeId("EMP001")
                .name("Test User")
                .email("test@ongc.in")
                .passwordHash("encodedPassword")
                .role("USER")
                .active(true)
                .build();
    }

    @Test
    void login_Success() {
        LoginRequest req = new LoginRequest("EMP001", "rawPassword");

        when(userRepository.findByEmployeeId("EMP001")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("rawPassword", "encodedPassword")).thenReturn(true);
        when(jwtService.generateToken(any(SecurityUser.class))).thenReturn("mock-jwt-token");
        when(jwtService.getExpirationTime()).thenReturn(86400L);

        AuthResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals("mock-jwt-token", resp.getToken());
        assertEquals("EMP001", resp.getUser().getEmployeeId());
        verify(auditService, times(1)).log(eq(1L), eq("LOGIN"), eq("USER"), any(), any(), any());
    }

    @Test
    void login_InvalidPassword_ThrowsUnauthorized() {
        LoginRequest req = new LoginRequest("EMP001", "wrongPassword");

        when(userRepository.findByEmployeeId("EMP001")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(req));
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void login_UserNotFound_ThrowsUnauthorized() {
        LoginRequest req = new LoginRequest("UNKNOWN", "password");

        when(userRepository.findByEmployeeId("UNKNOWN")).thenReturn(Optional.empty());

        assertThrows(UnauthorizedException.class, () -> authService.login(req));
    }

    @Test
    void login_InactiveUser_ThrowsUnauthorized() {
        sampleUser.setActive(false);
        LoginRequest req = new LoginRequest("EMP001", "rawPassword");

        when(userRepository.findByEmployeeId("EMP001")).thenReturn(Optional.of(sampleUser));

        assertThrows(UnauthorizedException.class, () -> authService.login(req));
    }

    @Test
    void register_Success_AssignsUserRoleStrictly() {
        com.sih.material.dto.auth.RegisterRequest regReq = com.sih.material.dto.auth.RegisterRequest.builder()
                .employeeId("USR999")
                .name("New Officer")
                .email("officer@ongc.in")
                .password("password123")
                .cpse("ONGC")
                .build();

        when(userRepository.existsByEmployeeId("USR999")).thenReturn(false);
        when(userRepository.existsByEmail("officer@ongc.in")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");
        when(cpseRepository.findByCode("ONGC")).thenReturn(Optional.of(com.sih.material.entity.Cpse.builder().id(1L).code("ONGC").build()));

        User savedUser = User.builder()
                .id(99L)
                .employeeId("USR999")
                .name("New Officer")
                .email("officer@ongc.in")
                .passwordHash("hashedPassword")
                .role("USER")
                .cpseId(1L)
                .active(true)
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        com.sih.material.dto.auth.UserSummaryDto result = authService.register(regReq);

        assertNotNull(result);
        assertEquals("USR999", result.getEmployeeId());
        assertEquals("USER", result.getRole()); // Asserts strict USER role
        verify(auditService, times(1)).log(eq(99L), eq("REGISTER"), eq("USER"), any(), any(), any());
    }

    @Test
    void register_DuplicateEmployeeId_ThrowsValidationException() {
        com.sih.material.dto.auth.RegisterRequest regReq = com.sih.material.dto.auth.RegisterRequest.builder()
                .employeeId("EMP001")
                .name("Existing")
                .email("new@test.com")
                .password("password")
                .build();

        when(userRepository.existsByEmployeeId("EMP001")).thenReturn(true);

        assertThrows(com.sih.material.exception.ValidationException.class, () -> authService.register(regReq));
    }
}
