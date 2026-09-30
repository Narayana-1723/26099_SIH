package com.sih.material.dto.common;

import lombok.*;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginatedResponse<T> {

    @Builder.Default
    private boolean success = true;

    private List<T> data;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    public long getTotal() {
        return totalElements;
    }

    public int getPageSize() {
        return size;
    }

    public static <T> PaginatedResponse<T> from(Page<T> page) {
        return PaginatedResponse.<T>builder()
                .success(true)
                .data(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}
