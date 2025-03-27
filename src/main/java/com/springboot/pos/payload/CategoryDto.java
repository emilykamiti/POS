package com.springboot.pos.payload;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Date;
@Data
public class CategoryDto {
    private Long id;

    @NotEmpty
    @Size(min = 2, message = "name should have at least 2 characters")
    private String name;
}
