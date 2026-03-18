package com.smartbiz.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterOtpResponse {
    private String message;
    private String email;
    private LocalDateTime expiresAt;
    private Integer expiresInSeconds;
}
