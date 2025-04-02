package com.springboot.pos.repository;

import com.springboot.pos.model.Sale;
import com.springboot.pos.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SaleRepository extends JpaRepository<Sale, Long> {

}

