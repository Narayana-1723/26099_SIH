package com.sih.material.service;

import com.sih.material.dto.cpse.CpseCreateRequest;
import com.sih.material.dto.cpse.CpseDto;
import com.sih.material.entity.Cpse;
import com.sih.material.exception.ResourceNotFoundException;
import com.sih.material.exception.ValidationException;
import com.sih.material.repository.CpseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CpseService {

    private final CpseRepository cpseRepository;

    public List<CpseDto> getAllActiveCpses() {
        return cpseRepository.findAllByActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<CpseDto> getAllCpses() {
        return cpseRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CpseDto getCpseById(Long id) {
        Cpse cpse = cpseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CPSE not found with id: " + id));
        return toDto(cpse);
    }

    public CpseDto getCpseByCode(String code) {
        Cpse cpse = cpseRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("CPSE not found with code: " + code));
        return toDto(cpse);
    }

    @Transactional
    public CpseDto createCpse(CpseCreateRequest request) {
        if (cpseRepository.existsByCode(request.getCode().trim().toUpperCase())) {
            throw new ValidationException("CPSE with code " + request.getCode() + " already exists");
        }

        Cpse cpse = Cpse.builder()
                .name(request.getName().trim())
                .code(request.getCode().trim().toUpperCase())
                .description(request.getDescription())
                .active(request.isActive())
                .build();

        return toDto(cpseRepository.save(cpse));
    }

    public CpseDto toDto(Cpse cpse) {
        return CpseDto.builder()
                .id(cpse.getId())
                .name(cpse.getName())
                .code(cpse.getCode())
                .description(cpse.getDescription())
                .active(cpse.isActive())
                .createdAt(cpse.getCreatedAt())
                .updatedAt(cpse.getUpdatedAt())
                .build();
    }
}
