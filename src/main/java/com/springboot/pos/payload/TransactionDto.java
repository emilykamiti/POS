package com.springboot.pos.payload;


import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransactionDto {

    private Long id;

    @NotBlank(message = "CheckoutRequestID is required")
    private String checkoutRequestId;

    private String transactionId;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^254\\d{9}$", message = "Phone number must be in format 254xxxxxxxxx")
    private String phoneNumber;

    @Positive(message = "Amount must be greater than 0")
    private double amount;

    @NotBlank(message = "Currency is required")
    private String currency;

    @NotBlank(message = "Status is required")
    private String status;

    private String resultCode;

    private String resultDesc;


    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}