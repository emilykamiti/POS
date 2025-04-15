package com.springboot.pos.service.impl;


import com.springboot.pos.service.NotificationService;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationServiceImpl implements NotificationService {

    @Override
    public void notifyAdmin(String message) {
        // Implement email to admin
        System.out.println("[ADMIN NOTIFICATION] " + message);
        // Real implementation would use JavaMailSender or other email service
    }

    @Override
    public void notifyPurchasing(String message) {
        // Implement email to purchasing department
        System.out.println("[PURCHASING NOTIFICATION] " + message);
    }
}