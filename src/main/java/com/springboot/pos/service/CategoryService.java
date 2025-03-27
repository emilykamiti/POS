package com.springboot.pos.service;

import com.springboot.pos.payload.CategoryDto;
import com.springboot.pos.payload.CategoryResponse;

public interface CategoryService {
    CategoryDto createCategory(CategoryDto categoryDto);

    CategoryResponse getAllCategories(int pageNo, int pageSize, String sortBy, String sortDir);

    void deleteCategoryById(long id);
}
