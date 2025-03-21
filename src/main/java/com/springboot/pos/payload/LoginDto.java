package com.springboot.pos.payload;

import lombok.Data;

@Data
public class LoginDto {
    private  String usernameOrEmail;
    private String password;
}
