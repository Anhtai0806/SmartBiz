package com.smartbiz.backend.exception;

public class EmailOrPhoneAlreadyExistsException extends RuntimeException {
    public EmailOrPhoneAlreadyExistsException(String message) {
        super(message);
    }
}
