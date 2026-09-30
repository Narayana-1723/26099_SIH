package com.sih.material.service;

import com.sih.material.entity.Cpse;
import com.sih.material.entity.User;
import com.sih.material.repository.CpseRepository;
import com.sih.material.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CpseRepository cpseRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminPassword;
    private final String reviewerPassword;
    private final String userPassword;

    public DataInitializer(UserRepository userRepository, CpseRepository cpseRepository, PasswordEncoder passwordEncoder,
                           @Value("${app.seed.admin-password}") String adminPassword,
                           @Value("${app.seed.reviewer-password}") String reviewerPassword,
                           @Value("${app.seed.user-password}") String userPassword) {
        this.userRepository = userRepository;
        this.cpseRepository = cpseRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminPassword = adminPassword;
        this.reviewerPassword = reviewerPassword;
        this.userPassword = userPassword;
    }

    @Override
    public void run(String... args) {
        // Ensure default CPSE exists
        if (cpseRepository.count() == 0) {
            cpseRepository.save(Cpse.builder()
                    .name("Oil and Natural Gas Corporation")
                    .code("ONGC")
                    .description("Indian central public sector undertaking under Ministry of Petroleum")
                    .active(true)
                    .build());
        }

        // Seed or verify default users
        createOrUpdateUser("ADM001", "System Administrator", "admin@sih.gov.in", adminPassword, "ADMIN", 1L);
        createOrUpdateUser("REV001", "Senior Material Reviewer", "reviewer@sih.gov.in", reviewerPassword, "REVIEWER", 1L);
        createOrUpdateUser("USR001", "Standard CPSE Officer", "user@ongc.in", userPassword, "USER", 1L);

        log.info("Seed users verified: ADM001 (ADMIN), REV001 (REVIEWER), USR001 (USER)");
    }

    private void createOrUpdateUser(String empId, String name, String email, String plainPassword, String role, Long cpseId) {
        Optional<User> existing = userRepository.findByEmployeeId(empId);
        if (existing.isEmpty()) {
            User user = User.builder()
                    .employeeId(empId)
                    .name(name)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(plainPassword))
                    .role(role)
                    .cpseId(cpseId)
                    .active(true)
                    .build();
            userRepository.save(user);
        } else {
            // Rotate only the known development seed password. Do not reset passwords
            // on every production restart after the initial migration.
            User user = existing.get();
            if (passwordEncoder.matches("password", user.getPasswordHash())
                    && !passwordEncoder.matches(plainPassword, user.getPasswordHash())) {
                user.setPasswordHash(passwordEncoder.encode(plainPassword));
                userRepository.save(user);
            }
        }
    }
}
