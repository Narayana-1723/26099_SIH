package com.sih.material.security;

import com.sih.material.entity.User;
import com.sih.material.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public SecurityUser loadUserByUsername(String username) throws UsernameNotFoundException {
        // Can authenticate via employeeId or email
        User user = userRepository.findByEmployeeId(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + username));
        return new SecurityUser(user);
    }
}
