package com.sih.material.service;

import com.sih.material.dto.user.UserCreateRequest;
import com.sih.material.dto.user.UserResponse;
import com.sih.material.dto.user.UserUpdateRequest;
import com.sih.material.entity.User;
import com.sih.material.exception.ResourceNotFoundException;
import com.sih.material.exception.ValidationException;
import com.sih.material.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public Page<UserResponse> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toUserResponse);
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse createUser(UserCreateRequest request, Long adminId) {
        if (userRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new ValidationException("User with employee ID " + request.getEmployeeId() + " already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("User with email " + request.getEmail() + " already exists");
        }

        User user = User.builder()
                .employeeId(request.getEmployeeId().trim().toUpperCase())
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole().trim().toUpperCase())
                .cpseId(request.getCpseId())
                .active(true)
                .build();

        User saved = userRepository.save(user);
        auditService.log(adminId, "USER_CREATED", "USER", saved.getId().toString(), null, "Created user " + saved.getEmployeeId());
        return toUserResponse(saved);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request, Long adminId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String oldVal = "role=" + user.getRole() + ", active=" + user.isActive();

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new ValidationException("Email " + newEmail + " is already in use");
            }
            user.setEmail(newEmail);
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null && !request.getRole().isBlank()) {
            user.setRole(request.getRole().trim().toUpperCase());
        }
        if (request.getCpseId() != null) {
            user.setCpseId(request.getCpseId());
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        User updated = userRepository.save(user);
        String newVal = "role=" + updated.getRole() + ", active=" + updated.isActive();
        auditService.log(adminId, "USER_UPDATE", "USER", updated.getId().toString(), oldVal, newVal);
        return toUserResponse(updated);
    }

    @Transactional
    public UserResponse updateUserStatus(Long id, boolean active, Long adminId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        boolean oldStatus = user.isActive();
        user.setActive(active);
        User updated = userRepository.save(user);

        String action = active ? "USER_ENABLED" : "USER_DISABLED";
        auditService.log(adminId, action, "USER", updated.getId().toString(), "active=" + oldStatus, "active=" + active);
        return toUserResponse(updated);
    }

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .employeeId(user.getEmployeeId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .cpseId(user.getCpseId())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
