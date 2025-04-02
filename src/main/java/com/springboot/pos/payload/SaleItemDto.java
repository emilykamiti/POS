package com.springboot.pos.payload;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class SaleItemDto {
    private Long id;
    private LocalDateTime saleDate;
    private double totalAmount;
}
