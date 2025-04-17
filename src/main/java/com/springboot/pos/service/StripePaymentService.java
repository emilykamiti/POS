package com.springboot.pos.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripePaymentService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    public StripePaymentService() {
        Stripe.apiKey = stripeApiKey;
    }

    public String processPayment(double amount, String currency, String description) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long) (amount * 100)) // Amount in cents
                .setCurrency(currency)
                .setDescription(description)
                .setPaymentMethod("pm_card_visa") // For testing; in production, collect from frontend
                .setConfirm(true)
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);
        return paymentIntent.getStatus(); // Returns "succeeded" or throws an exception if failed
    }
}