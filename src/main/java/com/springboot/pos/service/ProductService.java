package com.springboot.pos.service;

import com.springboot.pos.payload.ProductDto;
import com.springboot.pos.payload.ProductResponse;

public interface ProductService {

        ProductDto createProduct(ProductDto productDto);

        ProductResponse getAllProducts(int pageNo, int pageSize, String sortBy, String sortDir);

        ProductDto getProductById(long id);

        ProductDto updateProduct(ProductDto productDto, long id);

        void deleteProductById(long id);
    }

