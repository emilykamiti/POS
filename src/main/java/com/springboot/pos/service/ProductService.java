package com.springboot.pos.service;

import com.springboot.pos.payload.PagedResponse;
import com.springboot.pos.payload.ProductDto;

public interface ProductService {

        ProductDto createProduct(ProductDto productDto);
        PagedResponse<ProductDto> getAllProducts(int pageNo, int pageSize, String sortBy, String sortDir, String category);
        ProductDto getProductById(long id);
        ProductDto updateProduct(ProductDto productDto, long id);
        void deleteProductById(long id);
    }

