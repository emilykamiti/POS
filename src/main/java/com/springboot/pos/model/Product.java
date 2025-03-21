package com.springboot.pos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @Entity
    @Table(name = "products")
    public class Product {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "name", nullable = false)
        private String name;

        @Column(name = "price", nullable = false)
        private BigDecimal price;

        @Column(name = "stock", nullable = false)
        private int stock;

        @Column(name = "createdAt", nullable = false)
        private Date createdAt ;

        @Column(name = "updatedAr", nullable = false)
        private Date updatedAt;

        @ManyToOne
        @JoinColumn(name = "category_id", nullable=false)
        private Category category;

        @ManyToOne
        @JoinColumn(name =" supplier_id", nullable = false)
        private Supplier supplier;
    }


