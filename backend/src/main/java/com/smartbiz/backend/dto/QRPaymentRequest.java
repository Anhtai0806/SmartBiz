package com.smartbiz.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QRPaymentRequest {

    @NotBlank(message = "Image data is required")
    private String imageData;

    private String imageName;

    private String imageType;
}
