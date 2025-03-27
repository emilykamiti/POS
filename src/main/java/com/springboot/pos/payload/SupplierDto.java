package com.springboot.pos.payload;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SupplierDto {
    private long id;

    @NotEmpty
    @Size(min = 2, message = "name should have at least 2 characters")
    private String name;

    private String contact;
    private String address;
}
