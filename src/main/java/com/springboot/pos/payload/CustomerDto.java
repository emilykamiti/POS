package com.springboot.pos.payload;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerDto {
    private Long id;

    @NotEmpty
    @Size(min = 2, message = "name should have at least 2 characters")
    private String name;

    @NotEmpty(message = "Email should not  be null or empty")
    @Email
    private String email;

    @Size(min = 10, message = "Please enter a valid telephone number")
    private String phone;


    private int loyaltyPoints;
    private Date createdAt;
}
