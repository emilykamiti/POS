package com.springboot.pos.repository;

import com.springboot.pos.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByName(String name);

    // Optional: Add case-insensitive lookup
    @Query("SELECT s FROM Supplier s WHERE LOWER(s.name) = LOWER(:name)")
    Optional<Supplier> findByNameIgnoreCase(@Param("name") String name);
}