package com.springboot.pos.repository;

import com.springboot.pos.model.Sale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findBySaleDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    Page<Sale> findByCustomerNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);

    Page<Sale> findBySaleDateBetweenAndCustomerNameContainingIgnoreCase(
            LocalDateTime startDate, LocalDateTime endDate, @Param("name") String name, Pageable pageable);

    Page<Sale> findBySaleDateAfterAndCustomerNameContainingIgnoreCase(
            LocalDateTime startDate, @Param("name") String name, Pageable pageable);

    Page<Sale> findBySaleDateBeforeAndCustomerNameContainingIgnoreCase(
            LocalDateTime endDate, @Param("name") String name, Pageable pageable);
}

