package com.springboot.pos.payload;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SaleRequestDto {
    @NotEmpty(message = "Sale items cannot be empty")
    private List<SaleItemRequestDto> items;

    @Pattern(regexp = "M-PESA|VISA-CARD",
            message = "Payment method must be either 'M-PESA' or 'VISA-CARD'")
    private String paymentMethod;

    private Long userId;
    private Long customerId;

    // Discount percentage for the entire sale (e.g., 10% = 0.10)
    private Double discountPercentage;

    // Tax percentage (e.g., VAT/GST at 16% = 0.16)
    private Double taxPercentage;
}