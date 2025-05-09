package com.springboot.pos.payload;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SaleResponseDto {
    private Long id;
    private LocalDateTime saleDate;
    private BigDecimal subtotalPrice; // Before discounts and taxes
    private BigDecimal discountAmount; // Amount discounted
    private BigDecimal taxAmount; // Tax amount added
    private BigDecimal totalPrice; // Final price after discounts and taxes
    private UserDto user;
    private CustomerDto customer;
    private String paymentMethod;
    private List<SaleItemResponseDto> items;
    private TransactionDto transaction;
}