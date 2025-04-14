package com.springboot.pos.service.impl;

import com.springboot.pos.exception.ResourceNotFoundException;
import com.springboot.pos.model.Category;
import com.springboot.pos.payload.CategoryDto;
import com.springboot.pos.payload.PagedResponse;
import com.springboot.pos.repository.CategoryRepository;
import com.springboot.pos.service.CategoryService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
@Service
public class CategoryServiceImpl implements CategoryService {

    private CategoryRepository categoryRepository;
    private ModelMapper mapper;

    public CategoryServiceImpl(CategoryRepository categoryRepository, ModelMapper mapper) {
        this.categoryRepository = categoryRepository;
        this.mapper = mapper;
    }

    @Override
    public CategoryDto createCategory(CategoryDto categoryDto) {
        Category category = mapToEntity(categoryDto);
        Category newCategory = categoryRepository.save(category);

        //convert entity to DTO
        CategoryDto categoryResponse = mapToDTO(newCategory);
        return categoryResponse;
    }

    @Override
    public PagedResponse<CategoryDto> getAllCategories(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Category> categories = categoryRepository.findAll(pageable);

        List<CategoryDto> content = categories.getContent()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        PagedResponse<CategoryDto> categoryResponse = new PagedResponse<>();
        categoryResponse.setContent(content);
        categoryResponse.setPageNo(categories.getNumber());
        categoryResponse.setPageSize(categories.getSize());
        categoryResponse.setTotalElements(categories.getTotalElements());
        categoryResponse.setTotalPages(categories.getTotalPages());
        categoryResponse.setLast(categories.isLast());

        return categoryResponse;
    }

    @Override
    public void deleteCategoryById(long id) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
    }

    private CategoryDto mapToDTO(Category category) {
        CategoryDto categoryDto = mapper.map(category, CategoryDto.class);
        return categoryDto;
    }

    private Category mapToEntity(CategoryDto categoryDto) {
        Category category = mapper.map(categoryDto, Category.class);
        return category;
    }
}
