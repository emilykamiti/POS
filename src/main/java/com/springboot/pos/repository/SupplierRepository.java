package com.springboot.pos.repository;

import com.springboot.pos.model.Role;
import com.springboot.pos.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

}
