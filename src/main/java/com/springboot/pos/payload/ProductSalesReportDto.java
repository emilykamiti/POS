package com.springboot.pos.payload;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductSalesReportDto {
    private ProductDto product;
    private Integer totalUnitsSold;
    private BigDecimal totalRevenue;
    // Getters and setters
}
