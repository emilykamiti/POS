package com.springboot.pos.controller;

import com.springboot.pos.payload.PagedResponse;
import com.springboot.pos.payload.ProductDto;
import com.springboot.pos.service.ProductService;
import com.springboot.pos.utils.AppConstants;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ProductDto> createProduct(@Valid @RequestBody ProductDto productDto) {
        logger.info("Creating product: {}", productDto.getName());
        ProductDto response = productService.createProduct(productDto);
        logger.info("Product created with ID: {}", response.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public PagedResponse<ProductDto> getAllProducts(
            @RequestParam(value = "pageNo", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER, required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = AppConstants.DEFAULT_PAGE_SIZE, required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = AppConstants.DEFAULT_SORT_BY, required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstants.DEFAULT_SORT_DIRECTION, required = false) String sortDir
    ) {
        logger.info("Fetching all products - page: {}, size: {}, sortBy: {}, sortDir: {}", pageNo, pageSize, sortBy, sortDir);
        return productService.getAllProducts(pageNo, pageSize, sortBy, sortDir);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable(name = "id") long id) {
        logger.info("Fetching product with ID: {}", id);
        ProductDto response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(@Valid @RequestBody ProductDto productDto, @PathVariable(name = "id") long id) {
        logger.info("Updating product with ID: {}", id);
        ProductDto response = productService.updateProduct(productDto, id);
        logger.info("Product updated successfully: {}", response.getId());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable(name = "id") long id) {
        logger.info("Deleting product with ID: {}", id);
        productService.deleteProductById(id);
        logger.info("Product deleted successfully: {}", id);
        return new ResponseEntity<>("Product deleted successfully", HttpStatus.OK);
    }
}