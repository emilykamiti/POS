package com.springboot.pos.model;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "name", nullable = false)
    private String name;

    private String email;
    private String phoneNumber;

    private int loyaltyPoints;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Date createdAt;

}
