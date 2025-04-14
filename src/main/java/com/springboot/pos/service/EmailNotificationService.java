package com.springboot.pos.service;

public interface EmailNotificationService {
    void notifyAdmin(String message);
    void notifyPurchasing(String message);
}