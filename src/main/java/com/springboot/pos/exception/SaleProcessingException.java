package com.springboot.pos.exception;

public class SaleProcessingException extends RuntimeException {

    public SaleProcessingException(String message) {
        super(message);
    }

    public SaleProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
