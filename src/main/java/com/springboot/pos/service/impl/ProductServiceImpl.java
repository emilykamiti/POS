package com.springboot.pos.service.impl;

import com.springboot.pos.exception.ResourceNotFoundException;
import com.springboot.pos.model.*;
import com.springboot.pos.payload.*;
import com.springboot.pos.repository.*;
import com.springboot.pos.service.NotificationService;
import com.springboot.pos.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final NotificationService emailNotificationService;
    private final ModelMapper mapper;

    @Override
    @Transactional
    public ProductDto createProduct(ProductDto productDto) {
        Category category = categoryRepository.findByName(productDto.getCategoryName())
                .orElseGet(() -> {
                    Category newCategory = new Category();
                    newCategory.setName(productDto.getCategoryName());
                    return categoryRepository.save(newCategory);
                });

        Supplier supplier = supplierRepository.findByName(productDto.getSupplierName())
                .orElseGet(() -> {
                    Supplier newSupplier = new Supplier();
                    newSupplier.setName(productDto.getSupplierName());
                    return supplierRepository.save(newSupplier);
                });

        Product product = new Product();
        product.setName(productDto.getName());
        product.setPrice(productDto.getPrice());
        product.setStock(productDto.getStock());
        product.setStatus(productDto.getStatus());
        product.setDescription(productDto.getDescription());
        product.setReservedStock(productDto.getReservedStock());
        product.setLowStockThreshold(productDto.getLowStockThreshold());
        product.setLowStockMinimumOrder(productDto.getLowStockMinimumOrder());
        product.setImageUrl(productDto.getImageUrl());
        product.setCategory(category);
        product.setSupplier(supplier);

        Product newProduct = productRepository.save(product);
        return mapToDTO(newProduct);
    }

    @Override
    public ProductDto getProductById(long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToDTO(product);
    }

    @Override
    public PagedResponse<ProductDto> getAllProducts(int pageNo, int pageSize, String sortBy, String sortDir, String category) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);

        Page<Product> products;
        if (category != null && !category.isEmpty() && !"All".equalsIgnoreCase(category)) {
            products = productRepository.findByCategoryName(category, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }

        List<ProductDto> content = products.getContent()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        PagedResponse<ProductDto> productResponse = new PagedResponse<>();
        productResponse.setContent(content);
        productResponse.setPageNo(products.getNumber());
        productResponse.setPageSize(products.getSize());
        productResponse.setTotalElements(products.getTotalElements());
        productResponse.setTotalPages(products.getTotalPages());
        productResponse.setLast(products.isLast());

        return productResponse;
    }

    @Override
    @Transactional
    public ProductDto updateProduct(ProductDto productDto, long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        Category category = categoryRepository.findByName(productDto.getCategoryName())
                .orElseGet(() -> {
                    Category newCategory = new Category();
                    newCategory.setName(productDto.getCategoryName());
                    return categoryRepository.save(newCategory);
                });

        Supplier supplier = supplierRepository.findByName(productDto.getSupplierName())
                .orElseGet(() -> {
                    Supplier newSupplier = new Supplier();
                    newSupplier.setName(productDto.getSupplierName());
                    return supplierRepository.save(newSupplier);
                });

        product.setName(productDto.getName());
        product.setPrice(productDto.getPrice());
        product.setStock(productDto.getStock());
        product.setReservedStock(productDto.getReservedStock());
        product.setLowStockThreshold(productDto.getLowStockThreshold());
        product.setLowStockMinimumOrder(productDto.getLowStockMinimumOrder());
        product.setStatus(productDto.getStatus());
        product.setDescription(productDto.getDescription());
        product.setImageUrl(productDto.getImageUrl());
        product.setCategory(category);
        product.setSupplier(supplier);

        Product updatedProduct = productRepository.save(product);
        return mapToDTO(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProductById(long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        productRepository.delete(product);
    }

    @Transactional
    public void reserveStockForSale(SaleRequestDto saleRequest) {
        for (SaleItemRequestDto itemDto : saleRequest.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemDto.getProductId()));

            int availableStock = product.getStock() - product.getReservedStock();
            if (availableStock < itemDto.getQuantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: " + product.getName() +
                                ". Available: " + availableStock +
                                ", Requested: " + itemDto.getQuantity()
                );
            }
            product.setReservedStock(product.getReservedStock() + itemDto.getQuantity());
            productRepository.save(product);
        }
    }

    @Transactional
    public void releaseReservedStock(SaleRequestDto saleRequest) {
        for (SaleItemRequestDto itemDto : saleRequest.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemDto.getProductId()));

            product.setReservedStock(product.getReservedStock() - itemDto.getQuantity());
            if (product.getReservedStock() < 0) {
                product.setReservedStock(0);
            }
            productRepository.save(product);
        }
    }

    @Transactional
    public void updateProductStock(Product product, int quantitySold) {
        int newStock = product.getStock() - quantitySold;
        int newReservedStock = product.getReservedStock() - quantitySold;
        product.setStock(newStock);
        product.setReservedStock(Math.max(newReservedStock, 0));
        checkLowStock(product);
        productRepository.save(product);
    }

    @Transactional
    public void saveAllProducts(List<Product> products) {
        productRepository.saveAll(products);
    }

    private void checkLowStock(Product product) {
        if (product.getLowStockThreshold() > 0 &&
                product.getStock() < product.getLowStockThreshold()) {
            notifyLowStock(product);
            if (product.getSupplier() != null) {
                triggerReorder(product);
            }
        }
    }

    private void notifyLowStock(Product product) {
        String message = String.format(
                "Low stock alert: Product %s (ID: %d) is below threshold. Current stock: %d",
                product.getName(),
                product.getId(),
                product.getStock()
        );
        emailNotificationService.notifyAdmin(message);
    }

    private void triggerReorder(Product product) {
        int reorderQuantity = calculateReorderQuantity(product);

        if (reorderQuantity > 0) {
            String orderMessage = String.format(
                    "Auto-generated reorder for %s: %d units to %s",
                    product.getName(),
                    reorderQuantity,
                    product.getSupplier().getName()
            );
            emailNotificationService.notifyPurchasing(orderMessage);
        }
    }

    private int calculateReorderQuantity(Product product) {
        int targetStock = product.getLowStockThreshold() * 2;
        int suggestedOrder = targetStock - product.getStock();
        if (product.getLowStockMinimumOrder() > 0) {
            return Math.max(suggestedOrder, product.getLowStockMinimumOrder());
        }
        return suggestedOrder;
    }

    private ProductDto mapToDTO(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setStatus(product.getStatus());
        dto.setDescription(product.getDescription());
        dto.setReservedStock(product.getReservedStock());
        dto.setLowStockThreshold(product.getLowStockThreshold());
        dto.setLowStockMinimumOrder(product.getLowStockMinimumOrder());
        dto.setImageUrl(product.getImageUrl());
        dto.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : "Uncategorized");
        dto.setSupplierName(product.getSupplier() != null ? product.getSupplier().getName() : "Unknown");
        return dto;
    }

    public Product mapToEntity(ProductDto productDto) {
        Product product = new Product();
        product.setId(productDto.getId());
        product.setName(productDto.getName());
        product.setPrice(productDto.getPrice());
        product.setStock(productDto.getStock());
        product.setStatus(productDto.getStatus());
        product.setDescription(productDto.getDescription());
        product.setReservedStock(productDto.getReservedStock());
        product.setLowStockThreshold(productDto.getLowStockThreshold());
        product.setLowStockMinimumOrder(productDto.getLowStockMinimumOrder());
        product.setImageUrl(productDto.getImageUrl());
        return product;
    }
}