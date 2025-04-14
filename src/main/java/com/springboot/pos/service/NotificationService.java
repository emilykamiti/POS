package com.springboot.pos.service;

public interface NotificationService {
    void notifyAdmin(String message);
    void notifyPurchasing(String message);
}
