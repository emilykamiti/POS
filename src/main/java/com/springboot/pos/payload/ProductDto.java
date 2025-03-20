package com.springboot.pos.payload;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;
import java.util.Set;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

@Data
public class ProductDto {
    private Long id;

    private Date createdAt;
    private Date updatedAt;

    @NotEmpty
    @Size(min = 2, message = "name should have at least 2 characters")
    private String name;

    @NotEmpty
    private String barcode;

    @NotEmpty
    private int stock;

    @NotEmpty
    private BigDecimal price;


    private Set<CategoryDto> category;

    private Set<SupplierDto> supplier;
}

