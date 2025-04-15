package com.springboot.pos.service;

import com.springboot.pos.payload.CategoryDto;
import com.springboot.pos.payload.PagedResponse;

public interface CategoryService {
    CategoryDto createCategory(CategoryDto categoryDto);

    CategoryDto getCategoryById(long id);

    CategoryDto updateCategory(long id, CategoryDto categoryDto);

    PagedResponse<CategoryDto> getAllCategories(int pageNo, int pageSize, String sortBy, String sortDir);

    void deleteCategoryById(long id);
}