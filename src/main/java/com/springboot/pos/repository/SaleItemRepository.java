package com.springboot.pos.repository;

import com.springboot.pos.model.SaleItem;
import com.springboot.pos.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

}
