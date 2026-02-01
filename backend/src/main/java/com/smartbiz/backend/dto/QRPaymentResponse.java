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
public class QRPaymentResponse {

    private Long id;

    private String imageData;

    private String imageName;

    private String imageType;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
