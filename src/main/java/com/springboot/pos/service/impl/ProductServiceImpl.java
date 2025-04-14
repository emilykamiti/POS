package com.springboot.pos.service.impl;

import com.springboot.pos.exception.ResourceNotFoundException;
import com.springboot.pos.exception.SaleProcessingException;
import com.springboot.pos.model.*;
import com.springboot.pos.payload.*;
import com.springboot.pos.repository.*;
import com.springboot.pos.service.NotificationService;
import com.springboot.pos.service.ProductService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final SaleRepository saleRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ModelMapper mapper;
    private final EmailNotificationServiceImpl emailNotificationService;

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

    @Transactional(rollbackOn = Exception.class)
    public SaleResponseDto processSale(SaleRequestDto saleRequest) {
        try {
            Sale sale = new Sale();
            sale.setSaleDate(LocalDateTime.now());

            // Fetch and set user and customer
            if (saleRequest.getUserId() != null) {
                User user = userRepository.findById(saleRequest.getUserId())
                        .orElseThrow(() -> new ResourceNotFoundException("User", "id", saleRequest.getUserId()));
                sale.setUser(user);
            }
            if (saleRequest.getCustomerId() != null) {
                Customer customer = customerRepository.findById(saleRequest.getCustomerId())
                        .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", saleRequest.getCustomerId()));
                sale.setCustomer(customer);
            }
            sale.setPaymentMethod(saleRequest.getPaymentMethod());

            // Sales Calculation: Total Price = Quantity × Price per item
            BigDecimal subtotalAmount = BigDecimal.ZERO;
            List<Product> productsToUpdate = new ArrayList<>();

            for (SaleItemRequestDto itemDto : saleRequest.getItems()) {
                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemDto.getProductId()));

                if (product.getStock() < itemDto.getQuantity()) {
                    throw new IllegalArgumentException(
                            "Insufficient stock for product: " + product.getName() +
                                    ". Available: " + product.getStock() +
                                    ", Requested: " + itemDto.getQuantity()
                    );
                }

                BigDecimal unitPrice =product.getPrice();
                BigDecimal itemTotal = calculateItemTotal(itemDto.getQuantity(), unitPrice);
                subtotalAmount = subtotalAmount.add(itemTotal);

                updateProductStock(product, itemDto.getQuantity());
                productsToUpdate.add(product);

                SaleItem saleItem = createSaleItem(product, itemDto.getQuantity(), itemTotal, sale);
                sale.getSaleItems().add(saleItem); // Add SaleItem to Sale's list
            }

            productRepository.saveAll(productsToUpdate);

            // Discounts & Taxes
            BigDecimal discountAmount = BigDecimal.ZERO;
            if (saleRequest.getDiscountPercentage() != null && saleRequest.getDiscountPercentage() > 0) {
                BigDecimal discountPercentage = BigDecimal.valueOf(saleRequest.getDiscountPercentage());
                discountAmount = subtotalAmount.multiply(discountPercentage);
                subtotalAmount = subtotalAmount.subtract(discountAmount);
            }

            BigDecimal taxAmount = BigDecimal.ZERO;
            if (saleRequest.getTaxPercentage() != null && saleRequest.getTaxPercentage() > 0) {
                BigDecimal taxPercentage = BigDecimal.valueOf(saleRequest.getTaxPercentage());
                taxAmount = subtotalAmount.multiply(taxPercentage);
                subtotalAmount = subtotalAmount.add(taxAmount);
            }

            sale.setSubtotalAmount(subtotalAmount.doubleValue());
            sale.setDiscountAmount(discountAmount.doubleValue());
            sale.setTaxAmount(taxAmount.doubleValue());
            sale.setTotalAmount(subtotalAmount.doubleValue());

            sale = saleRepository.save(sale); // Save Sale, cascades to SaleItems

            return mapToSaleResponseDto(sale);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new SaleProcessingException("Failed to process sale: " + e.getMessage(), e);
        }
    }

    private SaleResponseDto mapToSaleResponseDto(Sale sale) {
        SaleResponseDto saleResponseDto = new SaleResponseDto();
        saleResponseDto.setId(sale.getId());
        saleResponseDto.setSaleDate(sale.getSaleDate());
        saleResponseDto.setSubtotalPrice(BigDecimal.valueOf(sale.getSubtotalAmount()));
        saleResponseDto.setDiscountAmount(BigDecimal.valueOf(sale.getDiscountAmount()));
        saleResponseDto.setTaxAmount(BigDecimal.valueOf(sale.getTaxAmount()));
        saleResponseDto.setTotalPrice(BigDecimal.valueOf(sale.getTotalAmount()));
        saleResponseDto.setUser(sale.getUser() != null ? mapper.map(sale.getUser(), UserDto.class) : null);
        saleResponseDto.setCustomer(sale.getCustomer() != null ? mapper.map(sale.getCustomer(), CustomerDto.class) : null);
        saleResponseDto.setPaymentMethod(sale.getPaymentMethod());
        List<SaleItemResponseDto> saleItems = sale.getSaleItems()
                .stream()
                .map(this::mapToSaleItemResponseDto)
                .collect(Collectors.toList());
        saleResponseDto.setItems(saleItems);
        return saleResponseDto;
    }

    private SaleItemResponseDto mapToSaleItemResponseDto(SaleItem saleItem) {
        SaleItemResponseDto saleItemDto = new SaleItemResponseDto();
        saleItemDto.setProductId(saleItem.getProduct().getId());
        saleItemDto.setProductName(saleItem.getProduct().getName());
        saleItemDto.setQuantity(saleItem.getQuantity());
        saleItemDto.setUnitPrice(saleItem.getUnitPrice());
        saleItemDto.setTotalPrice(saleItem.getTotalPrice());
//        saleItemDto.setSaleId(saleItem.getSale() != null ? saleItem.getSale().getId() : null);
        return saleItemDto;
    }

    private BigDecimal calculateItemTotal(int quantity, BigDecimal unitPrice) {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    private SaleItem createSaleItem(Product product, int quantity, BigDecimal totalPrice, Sale sale) {
        SaleItem saleItem = new SaleItem();
        saleItem.setProduct(product);
        saleItem.setQuantity(quantity);
        saleItem.setUnitPrice(product.getPrice());
        saleItem.setTotalPrice(totalPrice);
        saleItem.setSale(sale);
        return saleItem;
    }

    private void updateProductStock(Product product, int quantitySold) {
        int newStock = product.getStock() - quantitySold;
        product.setStock(newStock);
        checkLowStock(product);
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

    private Product mapToEntity(ProductDto productDto) {
        return mapper.map(productDto, Product.class);
    }
}