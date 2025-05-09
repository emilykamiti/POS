package com.springboot.pos.repository;

import com.springboot.pos.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByCheckoutRequestId(String checkoutRequestId);

    List<Transaction> findByStatusAndCreatedAtAfter(String status, LocalDateTime createdAt);

    List<Transaction> findByStatus(String status);

    Optional<Transaction> findByTransactionId(String transactionId);

    List<Transaction> findBySaleId(Long saleId);

    List<Transaction> findByPhoneNumber(String phoneNumber);

    List<Transaction> findByStatusAndCreatedAtBetween(
            String status,
            LocalDateTime startDate,
            LocalDateTime endDate
    );
}