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

    @Pattern(regexp = "M-PESA|VISA-CARD|CASH",
            message = "Payment method must be 'M-PESA', 'VISA-CARD', or 'CASH'")
    private String paymentMethod;

    private Long userId;
    private Long customerId;
    private String phoneNumber;
    private Double discountPercentage;
    private Double taxPercentage;
    private Integer useLoyaltyPoints;
    private String currency;
}