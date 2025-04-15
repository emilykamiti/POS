package com.springboot.pos.repository;

import com.springboot.pos.model.Category;
import com.springboot.pos.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
}
