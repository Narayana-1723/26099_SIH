package com.sih.material.service;

import com.sih.material.dto.auth.AuthResponse;
import com.sih.material.dto.auth.LoginRequest;
import com.sih.material.dto.auth.UserSummaryDto;
import com.sih.material.dto.auth.RegisterRequest;
import com.sih.material.entity.Cpse;
import com.sih.material.entity.User;
import com.sih.material.exception.UnauthorizedException;
import com.sih.material.exception.ValidationException;
import com.sih.material.repository.CpseRepository;
import com.sih.material.repository.UserRepository;
import com.sih.material.security.JwtService;
import com.sih.material.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final CpseRepository cpseRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository, CpseRepository cpseRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuditService auditService) {
        this.userRepository = userRepository;
        this.cpseRepository = cpseRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    public UserSummaryDto register(RegisterRequest request) {
        String empId = request.getEmployeeId() != null ? request.getEmployeeId().trim().toUpperCase() : "";
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";

        if (userRepository.existsByEmployeeId(empId)) {
            throw new ValidationException("Employee ID is already registered: " + empId);
        }
        if (userRepository.existsByEmail(email)) {
            throw new ValidationException("Email address is already registered: " + email);
        }

        Long cpseId = request.getCpseId();
        if (cpseId == null && request.getCpse() != null && !request.getCpse().isBlank()) {
            String cpseStr = request.getCpse().trim();
            try {
                cpseId = Long.parseLong(cpseStr);
            } catch (NumberFormatException e) {
                cpseId = cpseRepository.findByCode(cpseStr.toUpperCase())
                        .or(() -> cpseRepository.findByName(cpseStr))
                        .map(Cpse::getId)
                        .orElse(null);
            }
        }

        // Strict security rule: Public registrations ALWAYS receive standard USER role
        User user = User.builder()
                .employeeId(empId)
                .name(request.getName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .cpseId(cpseId)
                .active(true)
                .build();

        User saved = userRepository.save(user);
        auditService.log(saved.getId(), "REGISTER", "USER", saved.getId().toString(), null, "Public account registered with USER role");

        return toUserSummaryDto(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getEmployeeId();
        User user = userRepository.findByEmployeeId(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new UnauthorizedException("Invalid employee ID or password"));

        if (!user.isActive()) {
            throw new UnauthorizedException("User account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid employee ID or password");
        }

        SecurityUser securityUser = new SecurityUser(user);
        String token = jwtService.generateToken(securityUser);

        auditService.log(user.getId(), "LOGIN", "USER", user.getId().toString(), null, "User logged in successfully");

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .user(toUserSummaryDto(user))
                .build();
    }

    public UserSummaryDto getCurrentUser(String employeeId) {
        User user = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new UnauthorizedException("User session is invalid or user not found"));
        return toUserSummaryDto(user);
    }

    public void logout(Long userId) {
        if (userId != null) {
            auditService.log(userId, "LOGOUT", "USER", userId.toString(), null, "User logged out");
        }
    }

    public UserSummaryDto toUserSummaryDto(User user) {
        return UserSummaryDto.builder()
                .id(user.getId())
                .employeeId(user.getEmployeeId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .cpseId(user.getCpseId())
                .active(user.isActive())
                .build();
    }
}
