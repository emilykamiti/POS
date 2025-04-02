package com.springboot.pos.payload;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SaleDto {
    private Long id;
    private LocalDateTime saleDate;
    private double totalAmount;
    private UserDto user;
    private CustomerDto customer;

    //create ENUM for this.
    @Pattern(regexp = "M-PESA|VISA-CARD",
            message = "Payment method must be either 'M-PESA' or 'VISA-CARD'")
    private String paymentMethod;
}
