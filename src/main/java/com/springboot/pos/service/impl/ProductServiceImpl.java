package com.springboot.pos.service.impl;

import com.springboot.pos.exception.ResourceNotFoundException;
import com.springboot.pos.model.Category;
import com.springboot.pos.model.Product;
import com.springboot.pos.model.Supplier;
import com.springboot.pos.payload.ProductDto;
import com.springboot.pos.payload.ProductResponse;
import com.springboot.pos.repository.CategoryRepository;
import com.springboot.pos.repository.ProductRepository;
import com.springboot.pos.repository.SupplierRepository;
import com.springboot.pos.service.ProductService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private ProductRepository productRepository;
    private CategoryRepository categoryRepository;
    private SupplierRepository supplierRepository;
    private ModelMapper mapper;

    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              SupplierRepository supplierRepository,
                              ModelMapper mapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.mapper = mapper;
    }

    @Override
    public ProductDto createProduct(ProductDto productDto) {
        //convert DTO to entity
        Product product = mapToEntity(productDto);
        Product newProduct = productRepository.save(product);

        //convert entity to DTO
        ProductDto productResponse = mapToDTO(newProduct);
        return productResponse;
    }

    @Override
    public ProductResponse getAllProducts(int pageNo, int pageSize, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Product> products = productRepository.findAll(pageable);

        // get content from page object
        List<Product> listOfProducts = products.getContent();
        List<ProductDto> content = listOfProducts.stream().map(product -> mapToDTO(product)).collect(Collectors.toList());
        ProductResponse productResponse = new ProductResponse();
        productResponse.setContent(content);
        productResponse.setPageNo(products.getNumber());
        productResponse.setPageSize(products.getSize());
        productResponse.setTotalElements(products.getTotalElements());
        productResponse.setTotalPages(products.getTotalPages());
        productResponse.setLast(products.isLast());

        return productResponse;
    }

    @Override
    public ProductDto getProductById(long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToDTO(product);
    }

    @Override
    public ProductDto updateProduct(ProductDto productDto, long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        Category category = categoryRepository.findById(productDto.getCategoryId()).orElseThrow(() -> new ResourceNotFoundException("Category", "id", productDto.getCategoryId()));
        Supplier supplier = supplierRepository.findById(productDto.getSupplierId()).orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", productDto.getSupplierId()));
        product.setName(productDto.getName());
        product.setPrice(productDto.getPrice());
        product.setStock(productDto.getStock());
        product.setUpdatedAt(productDto.getUpdatedAt());
        product.setUpdatedAt(productDto.getUpdatedAt());
        product.setCategory(category);
        product.setSupplier(supplier);

        Product updatedProduct = productRepository.save(product);
        return mapToDTO(updatedProduct);
    }

    @Override
    public void deleteProductById(long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        productRepository.delete(product);

    }

    // converted entity into DTO
    private ProductDto mapToDTO(Product product) {
        ProductDto productDto = mapper.map(product, ProductDto.class);
        return productDto;
    }

    private Product mapToEntity(ProductDto productDto) {
        Product product = mapper.map(productDto, Product.class);
        return product;
    }
}

