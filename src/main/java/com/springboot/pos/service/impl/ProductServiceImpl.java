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
    public ProductDto createProduct(ProductDto productDto) {
        Product product = mapToEntity(productDto);
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
    public PagedResponse<ProductDto> getAllProducts(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Product> products = productRepository.findAll(pageable);

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
    public ProductDto updateProduct(ProductDto productDto, long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        Category category = categoryRepository.findById(productDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", productDto.getCategoryId()));
        Supplier supplier = supplierRepository.findById(productDto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", productDto.getSupplierId()));
        product.setName(productDto.getName());
        product.setPrice(productDto.getPrice());
        product.setStock(productDto.getStock());
        product.setUpdatedAt(productDto.getUpdatedAt());
        product.setCategory(category);
        product.setSupplier(supplier);

        Product updatedProduct = productRepository.save(product);
        return mapToDTO(updatedProduct);
    }

    @Override
    public void deleteProductById(long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        productRepository.delete(product);
    }

    public void reserveStockForSale(SaleRequestDto saleRequest) {
        for (SaleItemRequestDto itemDto : saleRequest.getItems()) {
            ProductDto productDto = getProductById(itemDto.getProductId());
            Product product = mapToEntity(productDto);
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

    public void releaseReservedStock(SaleRequestDto saleRequest) {
        for (SaleItemRequestDto itemDto : saleRequest.getItems()) {
            ProductDto productDto = getProductById(itemDto.getProductId());
            Product product = mapToEntity(productDto);
            product.setReservedStock(product.getReservedStock() - itemDto.getQuantity());
            if (product.getReservedStock() < 0) {
                product.setReservedStock(0);
            }
            productRepository.save(product);
        }
    }

    public void updateProductStock(Product product, int quantitySold) {
        int newStock = product.getStock() - quantitySold;
        int newReservedStock = product.getReservedStock() - quantitySold;
        product.setStock(newStock);
        product.setReservedStock(Math.max(newReservedStock, 0));
        checkLowStock(product);
    }

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
        return mapper.map(product, ProductDto.class);
    }

    public Product mapToEntity(ProductDto productDto) {
        return mapper.map(productDto, Product.class);
    }
}