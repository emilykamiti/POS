package com.springboot.pos.exception;

import org.springframework.http.HttpStatus;

public class PosApiException extends RuntimeException {

        private HttpStatus status;
        private String message;

        public PosApiException (HttpStatus status, String message) {
            this.status = status;
            this.message = message;
        }

        public PosApiException(String message, HttpStatus status, String message1) {
            super(message);
            this.status = status;
            this.message = message1;
        }
    }

