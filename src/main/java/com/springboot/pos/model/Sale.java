package com.springboot.pos.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime saleDate;

    private double subtotalAmount; // Before discounts and taxes
    private double discountAmount; // Amount discounted
    private double taxAmount; // Tax amount added
    private double totalAmount; // Final amount after discounts and taxes

    @ManyToOne
    private User user;

    @ManyToOne
    private Customer customer;

    private String paymentMethod;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> saleItems = new ArrayList<>();
}