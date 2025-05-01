package com.springboot.pos.service.impl;

import com.springboot.pos.exception.ResourceNotFoundException;
import com.springboot.pos.exception.SaleProcessingException;
import com.springboot.pos.model.*;
import com.springboot.pos.payload.*;
import com.springboot.pos.repository.*;
import com.springboot.pos.service.SaleItemService;
import com.springboot.pos.service.SaleService;
import com.springboot.pos.service.MpesaPaymentService;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ProductServiceImpl productService;
    private final SaleItemService saleItemService;
    private final ModelMapper mapper;
    private final AuditLogRepository auditLogRepository;
    private final MpesaPaymentService mpesaPaymentService;

    public SaleServiceImpl(
            SaleRepository saleRepository,
            UserRepository userRepository,
            CustomerRepository customerRepository,
            ProductServiceImpl productService,
            SaleItemService saleItemService,
            ModelMapper mapper,
            AuditLogRepository auditLogRepository,
            MpesaPaymentService mpesaPaymentService
    ) {
        this.saleRepository = saleRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.productService = productService;
        this.saleItemService = saleItemService;
        this.mapper = mapper;
        this.auditLogRepository = auditLogRepository;
        this.mpesaPaymentService = mpesaPaymentService;
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public SaleResponseDto processSale(SaleRequestDto saleRequest) {
        try {
            // Reserve stock to prevent overselling
            productService.reserveStockForSale(saleRequest);

            // Create Sale entity
            Sale sale = new Sale();
            sale.setSaleDate(LocalDateTime.now());

            if (saleRequest.getUserId() != null) {
                User user = userRepository.findById(saleRequest.getUserId())
                        .orElseThrow(() -> new ResourceNotFoundException("User", "id", saleRequest.getUserId()));
                sale.setUser(user);
            }
            Customer customer = null;
            if (saleRequest.getCustomerId() != null) {
                customer = customerRepository.findById(saleRequest.getCustomerId())
                        .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", saleRequest.getCustomerId()));
                sale.setCustomer(customer);
            }
            sale.setPaymentMethod(saleRequest.getPaymentMethod());

            // Initialize required fields
            String currency = saleRequest.getCurrency() != null ? saleRequest.getCurrency() : "KES";
            BigDecimal subtotalAmount = BigDecimal.ZERO;
            List<Product> productsToUpdate = new ArrayList<>();
            List<SaleItem> saleItems = new ArrayList<>();

            for (SaleItemRequestDto itemDto : saleRequest.getItems()) {
                ProductDto productDto = productService.getProductById(itemDto.getProductId());
                Product product = productService.mapToEntity(productDto);

                BigDecimal unitPrice = convertCurrency(product.getPrice(), "KES", currency);
                BigDecimal itemTotal = calculateItemTotal(itemDto.getQuantity(), unitPrice);
                subtotalAmount = subtotalAmount.add(itemTotal);

                productService.updateProductStock(product, itemDto.getQuantity());
                productsToUpdate.add(product);

                SaleItemResponseDto saleItemDto = new SaleItemResponseDto();
                saleItemDto.setProductId(product.getId());
                saleItemDto.setProductName(product.getName());
                saleItemDto.setQuantity(itemDto.getQuantity());
                saleItemDto.setUnitPrice(unitPrice);
                saleItemDto.setTotalPrice(itemTotal);

                // Prepare SaleItem entity
                SaleItem saleItem = saleItemService.prepareSaleItem(saleItemDto);
                saleItem.setSale(sale); // Set bidirectional relationship
                saleItems.add(saleItem);
            }

            // Set sale items on the Sale entity
            sale.setSaleItems(saleItems);

            // Ensure each SaleItem is aware of its Sale
            for (SaleItem saleItem : saleItems) {
                saleItem.setSale(sale);
            }

            // Calculate discounts and taxes
            BigDecimal loyaltyDiscount = BigDecimal.ZERO;
            if (customer != null && saleRequest.getUseLoyaltyPoints() != null && saleRequest.getUseLoyaltyPoints() > 0) {
                int pointsToUse = Math.min(saleRequest.getUseLoyaltyPoints(), customer.getLoyaltyPoints());
                loyaltyDiscount = convertCurrency(BigDecimal.valueOf(pointsToUse), "KES", currency);
                customer.setLoyaltyPoints(customer.getLoyaltyPoints() - pointsToUse);
            }

            BigDecimal discountAmount = BigDecimal.ZERO;
            if (saleRequest.getDiscountPercentage() != null && saleRequest.getDiscountPercentage() > 0) {
                BigDecimal discountPercentage = BigDecimal.valueOf(saleRequest.getDiscountPercentage());
                discountAmount = subtotalAmount.multiply(discountPercentage);
                subtotalAmount = subtotalAmount.subtract(discountAmount);
            }

            subtotalAmount = subtotalAmount.subtract(loyaltyDiscount);

            BigDecimal taxAmount = BigDecimal.ZERO;
            if (saleRequest.getTaxPercentage() != null && saleRequest.getTaxPercentage() > 0) {
                BigDecimal taxPercentage = BigDecimal.valueOf(saleRequest.getTaxPercentage());
                taxAmount = subtotalAmount.multiply(taxPercentage);
                subtotalAmount = subtotalAmount.add(taxAmount);
            }

            // Set all required fields before payment processing
            sale.setSubtotalAmount(subtotalAmount.doubleValue());
            sale.setDiscountAmount(discountAmount.doubleValue());
            sale.setTaxAmount(taxAmount.doubleValue());
            sale.setTotalAmount(subtotalAmount.doubleValue());

            // Process payment via M-Pesa STK Push before saving the sale
            String phoneNumber = saleRequest.getPhoneNumber();
            if (phoneNumber == null && customer != null) {
                phoneNumber = customer.getPhoneNumber();
            }
            if (phoneNumber == null) {
                throw new SaleProcessingException("Customer phone number is required for M-Pesa payment");
            }
            if (!phoneNumber.startsWith("254")) {
                phoneNumber = "254" + phoneNumber.substring(1);
            }

            // Initiate STK Push payment
            Transaction transaction;
            try {
                transaction = mpesaPaymentService.initiatePayment(
                        sale.getTotalAmount(),
                        phoneNumber,
                        currency,
                        "POS Sale Transaction - Sale ID: " + sale.getId()
                );
            } catch (Exception e) {
                throw new SaleProcessingException("Failed to initiate M-Pesa payment: " + e.getMessage(), e);
            }

            // Wait for payment confirmation (with a timeout of 60 seconds)
            boolean paymentSuccessful;
            try {
                paymentSuccessful = mpesaPaymentService.confirmPayment(transaction, 60);
            } catch (InterruptedException e) {
                throw new SaleProcessingException("Payment confirmation interrupted: " + e.getMessage(), e);
            }

            if (!paymentSuccessful) {
                throw new SaleProcessingException("M-Pesa payment failed: " + transaction.getResultDesc());
            }

            // Link the transaction to the sale
            transaction.setSale(sale);
            sale.setTransaction(transaction);

            // Update customer loyalty points after successful payment
            if (customer != null) {
                BigDecimal subtotalInKES = convertCurrency(subtotalAmount, currency, "KES");
                int pointsEarned = subtotalInKES.divide(BigDecimal.valueOf(100), RoundingMode.FLOOR).intValue();
                customer.setLoyaltyPoints(customer.getLoyaltyPoints() + pointsEarned);
                customerRepository.save(customer);
            }

            // Save the sale and related data after payment is successful
            sale = saleRepository.save(sale);
            for (SaleItem saleItem : sale.getSaleItems()) {
                saleItemService.logSaleItemCreation(saleItem);
            }

            // Log the sale creation
            AuditLog log = new AuditLog();
            log.setEntityType("Sale");
            log.setEntityId(sale.getId());
            log.setAction("CREATE");
            log.setUser(SecurityContextHolder.getContext().getAuthentication().getName());
            log.setTimestamp(LocalDateTime.now());
            log.setDetails("Created sale with total amount: " + sale.getTotalAmount() + " " + currency + ", M-Pesa Transaction ID: " + transaction.getTransactionId());
            auditLogRepository.save(log);

            return mapToSaleResponseDto(sale);
        } catch (IllegalArgumentException e) {
            productService.releaseReservedStock(saleRequest);
            throw e;
        } catch (Exception e) {
            productService.releaseReservedStock(saleRequest);
            throw new SaleProcessingException("Failed to process sale: " + e.getMessage(), e);
        }
    }

    @Override
    public PagedResponse<SaleResponseDto> getAllSales(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Sale> sales = saleRepository.findAll(pageable);

        List<SaleResponseDto> content = sales.getContent()
                .stream()
                .map(this::mapToSaleResponseDto)
                .collect(Collectors.toList());
        PagedResponse<SaleResponseDto> saleResponse = new PagedResponse<>();
        saleResponse.setContent(content);
        saleResponse.setPageNo(sales.getNumber());
        saleResponse.setPageSize(sales.getSize());
        saleResponse.setTotalElements(sales.getTotalElements());
        saleResponse.setTotalPages(sales.getTotalPages());
        saleResponse.setLast(sales.isLast());
        return saleResponse;
    }

    @Override
    public SaleResponseDto getSaleById(long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale", "id", id));
        return mapToSaleResponseDto(sale);
    }

    public List<ProductSalesReportDto> getProductSalesReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<Sale> sales = saleRepository.findBySaleDateBetween(startDate, endDate);
        Map<Product, Integer> productSales = new HashMap<>();

        for (Sale sale : sales) {
            for (SaleItem saleItem : sale.getSaleItems()) {
                Product product = saleItem.getProduct();
                productSales.merge(product, saleItem.getQuantity(), Integer::sum);
            }
        }

        return productSales.entrySet().stream()
                .map(entry -> {
                    ProductSalesReportDto report = new ProductSalesReportDto();
                    report.setProduct(mapper.map(entry.getKey(), ProductDto.class));
                    report.setTotalUnitsSold(entry.getValue());
                    report.setTotalRevenue(entry.getKey().getPrice().multiply(BigDecimal.valueOf(entry.getValue())));
                    return report;
                })
                .sorted((a, b) -> b.getTotalUnitsSold().compareTo(a.getTotalUnitsSold()))
                .collect(Collectors.toList());
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
        return saleItemDto;
    }

    private Sale mapToEntity(SaleResponseDto saleResponseDto) {
        Sale sale = mapper.map(saleResponseDto, Sale.class);
        return sale;
    }

    private BigDecimal calculateItemTotal(int quantity, BigDecimal unitPrice) {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    private BigDecimal convertCurrency(BigDecimal amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equals(toCurrency)) return amount;
        BigDecimal exchangeRate = fetchExchangeRate(fromCurrency, toCurrency);
        return amount.multiply(exchangeRate).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal fetchExchangeRate(String fromCurrency, String toCurrency) {
        Map<String, BigDecimal> ratesFromKES = new HashMap<>();
        ratesFromKES.put("KES", BigDecimal.ONE);
        ratesFromKES.put("USD", BigDecimal.valueOf(0.0078));

        if (!ratesFromKES.containsKey(fromCurrency) || !ratesFromKES.containsKey(toCurrency)) {
            throw new IllegalArgumentException("Unsupported currency pair: " + fromCurrency + " to " + toCurrency);
        }
        BigDecimal rateFrom = ratesFromKES.get(fromCurrency);
        BigDecimal rateTo = ratesFromKES.get(toCurrency);
        return rateTo.divide(rateFrom, 6, RoundingMode.HALF_UP);
    }
}