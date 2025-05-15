package com.springboot.pos.service;

import com.springboot.pos.model.Product;
import com.springboot.pos.payload.PagedResponse;
import com.springboot.pos.payload.ProductDto;
import com.springboot.pos.payload.SaleRequestDto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ProductService {
        ProductDto createProduct(ProductDto productDto, MultipartFile image) throws IOException;
        ProductDto getProductById(long id);
        PagedResponse<ProductDto> getAllProducts(int pageNo, int pageSize, String sortBy, String sortDir, String category);
        ProductDto updateProduct(ProductDto productDto, long id, MultipartFile image) throws IOException;
        void deleteProductById(long id);
        void reserveStockForSale(SaleRequestDto saleRequest);
        void releaseReservedStock(SaleRequestDto saleRequest);
        void updateProductStock(Product product, int quantitySold);
        void saveAllProducts(List<Product> products);
}