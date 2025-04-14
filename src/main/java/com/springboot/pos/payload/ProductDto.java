package com.springboot.pos.payload;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;
import java.util.Set;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

@Data
public class ProductDto {
    private Long id;

    private int lowStockThreshold;
    private int lowStockMinimumOrder;
    private Date createdAt;
    private Date updatedAt;

    @NotEmpty
    @Size(min = 2, message = "name should have at least 2 characters")
    private String name;

    //later update to enum.
    @NotNull
    @Pattern(regexp = "AVAILABLE|NOT_AVAILABLE",
            message = "Status must be either 'AVAILABLE' or 'NOT_AVAILABLE'")
    private String status;

    @NotNull
    private int stock;

    @NotNull
    private BigDecimal price;


    private Long categoryId;
//    private String categoryName;

    private Long supplierId;
//    private String supplierName;


}

