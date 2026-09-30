package com.sih.material.dto.user;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatusUpdateRequest {

    @NotNull(message = "Active status is required")
    private Boolean active;
}
