package com.springboot.pos.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity

@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "checkout_requestid")
    private String checkoutRequestId; //

    private String transactionId; // M-Pesa Transaction ID (e.g., Receipt Number)

    private String phoneNumber;

    private double amount;

    private String currency;

    private String status; // PENDING, SUCCESS, FAILED

    private String resultCode; // From callback

    private String resultDesc; // From callback

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToOne
    @JoinColumn(name = "sale_id")
    private Sale sale;

    public void setSale(Sale sale) {
        this.sale = sale;
        if (sale != null && sale.getTransaction() != this) {
            sale.setTransaction(this);
        }
    }}