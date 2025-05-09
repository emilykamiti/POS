package com.springboot.pos.payload;

import com.fasterxml.jackson.annotation.JsonProperty;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MpesaCallbackDTO {
    @JsonProperty("MerchantRequestID")
    @NotBlank(message = "MerchantRequestID is mandatory")
    private String merchantRequestID;

    @JsonProperty("CheckoutRequestID")
    @NotBlank(message = "CheckoutRequestID is mandatory")
    private String checkoutRequestID;

    @JsonProperty("ResultCode")
    @NotNull(message = "ResultCode is mandatory")
    private Integer resultCode;

    @JsonProperty("ResultDesc")
    @NotBlank(message = "ResultDesc is mandatory")
    private String resultDesc;

    @JsonProperty("Amount")
    private Double amount;

    @JsonProperty("MpesaReceiptNumber")
    private String mpesaReceiptNumber;

    @JsonProperty("TransactionDate")
    private String transactionDate;

    @JsonProperty("PhoneNumber")
    private String phoneNumber;
}