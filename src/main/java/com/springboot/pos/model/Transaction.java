package com.springboot.pos.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String checkoutRequestId; // M-Pesa CheckoutRequestID to match callback

    private String transactionId; // M-Pesa Transaction ID (e.g., Receipt Number)

    private String phoneNumber;

    private double amount;

    private String currency;

    private String status; // PENDING, SUCCESS, FAILED

    private String resultCode; // From callback

    private String resultDesc; // From callback

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToOne
    @JoinColumn(name = "sale_id")
    private Sale sale;

    public void setSale(Sale sale) {
        this.sale = sale;
        if (sale != null && sale.getTransaction() != this) {
            sale.setTransaction(this);
        }
    }
}