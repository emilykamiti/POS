package com.springboot.pos.payload;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SaleItemResponseDto {
    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
