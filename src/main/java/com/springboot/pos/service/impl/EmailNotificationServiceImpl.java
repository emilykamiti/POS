package com.springboot.pos.service.impl;

import com.springboot.pos.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${app.email.admin}")
    private String adminEmail;

    @Value("${app.email.purchasing}")
    private String purchasingEmail;

    @Value("${app.base-url}")
    private String baseUrl;

    public EmailNotificationServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void notifyAdmin(String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(adminEmail);
            mailMessage.setSubject("POS System Notification");
            mailMessage.setText(message);
            mailMessage.setFrom("no-reply@yourdomain.com");
            mailSender.send(mailMessage);
            logger.info("Admin notification sent to {}: {}", adminEmail, message);
        } catch (MailException e) {
            logger.error("Failed to send admin notification to {}: {}", adminEmail, e.getMessage());
        }
    }

    @Override
    public void notifyPurchasing(String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(purchasingEmail);
            mailMessage.setSubject("POS System Purchasing Alert");
            mailMessage.setText(message);
            mailMessage.setFrom("no-reply@yourdomain.com");
            mailSender.send(mailMessage);
            logger.info("Purchasing notification sent to {}: {}", purchasingEmail, message);
        } catch (MailException e) {
            logger.error("Failed to send purchasing notification to {}: {}", purchasingEmail, e.getMessage());
        }
    }

    public void sendVerificationEmail(String toEmail, String verificationToken) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(toEmail);
            mailMessage.setSubject("POS System - Verify Your Email");
            mailMessage.setText("Please verify your email by clicking the following link: " +
                    baseUrl + "/api/auth/verify?token=" + verificationToken);
            mailMessage.setFrom("no-reply@yourdomain.com");
            mailSender.send(mailMessage);
            logger.info("Verification email sent to {}", toEmail);
        } catch (MailException e) {
            logger.error("Failed to send verification email to {}: {}", toEmail, e.getMessage());
        }
    }
}