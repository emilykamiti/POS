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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SaleServiceImpl implements SaleService {

    private static final Logger logger = LoggerFactory.getLogger(SaleServiceImpl.class);

    private final SaleRepository saleRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ProductServiceImpl productService;
    private final SaleItemService saleItemService;
    private final ModelMapper mapper;
    private final AuditLogRepository auditLogRepository;
    private final MpesaPaymentService mpesaPaymentService;
    private final TransactionRepository transactionRepository;

    public SaleServiceImpl(
            SaleRepository saleRepository,
            UserRepository userRepository,
            CustomerRepository customerRepository,
            ProductServiceImpl productService,
            SaleItemService saleItemService,
            ModelMapper mapper,
            AuditLogRepository auditLogRepository,
            MpesaPaymentService mpesaPaymentService,
            TransactionRepository transactionRepository
    ) {
        this.saleRepository = saleRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.productService = productService;
        this.saleItemService = saleItemService;
        this.mapper = mapper;
        this.auditLogRepository = auditLogRepository;
        this.mpesaPaymentService = mpesaPaymentService;
        this.transactionRepository = transactionRepository;
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public SaleResponseDto processSale(SaleRequestDto saleRequest) {
        Objects.requireNonNull(saleRequest, "Sale request cannot be null");
        if (saleRequest.getItems() == null || saleRequest.getItems().isEmpty()) {
            throw new IllegalArgumentException("Sale items cannot be empty");
        }

        Transaction transaction = null;
        Sale sale = null;

        try {
            // 1. Reserve stock
            productService.reserveStockForSale(saleRequest);

            // 2. Create and persist Sale
            sale = createAndPersistSale(saleRequest);

            // 3. Process payment if M-PESA
            if ("M-PESA".equals(saleRequest.getPaymentMethod())) {
                transaction = processMpesaPayment(saleRequest, sale);
            }

            //? we could add usage of other payment methods here.

            // 4. Finalize sale
            return finalizeSaleProcessing(saleRequest, sale, transaction);

        } catch (Exception e) {
            handleProcessingFailure(saleRequest, transaction, e);
            throw new SaleProcessingException("Failed to process sale: " + e.getMessage(), e);
        }
    }

    private Sale createAndPersistSale(SaleRequestDto saleRequest) {
        Sale sale = new Sale();
        sale.setSaleDate(LocalDateTime.now());
        sale.setPaymentMethod(saleRequest.getPaymentMethod());

        // Set user if provided
        if (saleRequest.getUserId() != null) {
            User user = userRepository.findById(saleRequest.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", saleRequest.getUserId()));
            sale.setUser(user);
        }

        // Set customer if provided
        Customer customer = null;
        if (saleRequest.getCustomerId() != null) {
            customer = customerRepository.findById(saleRequest.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", saleRequest.getCustomerId()));
            sale.setCustomer(customer);
        }

        // Process sale items
        String currency = Optional.ofNullable(saleRequest.getCurrency()).orElse("KES");
        List<SaleItem> saleItems = processSaleItems(saleRequest, sale, currency);
        sale.setSaleItems(saleItems);

        // Calculate pricing
        BigDecimal subtotalAmount = calculateSubtotalAmount(saleItems);
        BigDecimal discountAmount = calculateDiscount(saleRequest, subtotalAmount);
        BigDecimal loyaltyDiscount = calculateLoyaltyDiscount(saleRequest, customer, currency);
        BigDecimal taxAmount = calculateTax(saleRequest, subtotalAmount.subtract(discountAmount).subtract(loyaltyDiscount));

        // Set final amounts
        BigDecimal totalAmount = subtotalAmount.subtract(discountAmount).subtract(loyaltyDiscount).add(taxAmount);
        setSaleAmounts(sale, subtotalAmount, discountAmount, loyaltyDiscount, taxAmount, totalAmount);

        // Persist the sale to generate ID
        return saleRepository.save(sale);
    }

    private List<SaleItem> processSaleItems(SaleRequestDto saleRequest, Sale sale, String currency) {
        return saleRequest.getItems().stream()
                .map(itemDto -> {
                    ProductDto productDto = productService.getProductById(itemDto.getProductId());
                    Product product = productService.mapToEntity(productDto);

                    BigDecimal unitPrice = convertCurrency(product.getPrice(), "KES", currency);
                    BigDecimal itemTotal = calculateItemTotal(itemDto.getQuantity(), unitPrice);

                    SaleItem saleItem = saleItemService.prepareSaleItem(
                            SaleItemResponseDto.of(
                                    null, // id can be null if it's auto-generated
                                    product.getId(),
                                    product.getName(),
                                    itemDto.getQuantity(),
                                    unitPrice,
                                    itemTotal
                            )
                    );
                    saleItem.setSale(sale);
                    return saleItem;
                })
                .collect(Collectors.toList());
    }

    private Transaction processMpesaPayment(SaleRequestDto saleRequest, Sale sale) throws Exception {
        Customer customer = sale.getCustomer();
        String phoneNumber = validateAndFormatPhoneNumber(
                saleRequest.getPhoneNumber(),
                customer
        );
        String currency = Optional.ofNullable(saleRequest.getCurrency()).orElse("KES");

        Transaction transaction = mpesaPaymentService.initiatePayment(
                sale.getTotalAmount(),
                phoneNumber,
                currency,
                "POS Sale Transaction - Sale ID: " + sale.getId(),
                sale
        );

        logger.info("Payment initiated with CheckoutRequestID: {}", transaction.getCheckoutRequestId());

        if (!mpesaPaymentService.confirmPayment(transaction, 180)) {
            throw new SaleProcessingException("M-Pesa payment failed: " + transaction.getResultDesc());
        }

        return transaction;
    }

    private SaleResponseDto finalizeSaleProcessing(SaleRequestDto saleRequest, Sale sale, Transaction transaction) {
        // Update customer loyalty points
        if (sale.getCustomer() != null) {
            updateCustomerLoyaltyPoints(
                    sale.getCustomer(),
                    BigDecimal.valueOf(sale.getTotalAmount()),
                    Optional.ofNullable(saleRequest.getCurrency()).orElse("KES"),
                    saleRequest.getUseLoyaltyPoints()
            );
        }

        // Update transaction reference if exists
        if (transaction != null) {
            sale.setTransaction(transaction);
            sale = saleRepository.save(sale);
        }

        // Log sale items and audit
        logSaleItems(sale);
        logAudit(sale,
                Optional.ofNullable(saleRequest.getCurrency()).orElse("KES"),
                transaction);

        return mapToSaleResponseDto(sale);
    }

    private void handleProcessingFailure(SaleRequestDto saleRequest, Transaction transaction, Exception e) {
        logger.error("Sale processing failed: {}", e.getMessage(), e);
        productService.releaseReservedStock(saleRequest);

        if (transaction != null) {
            transaction.setStatus("FAILED");
            transaction.setResultDesc(e.getMessage());
            transactionRepository.save(transaction);
        }
    }

    private BigDecimal calculateSubtotalAmount(List<SaleItem> saleItems) {
        return saleItems.stream()
                .map(SaleItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void setSaleAmounts(Sale sale, BigDecimal subtotalAmount, BigDecimal discountAmount,
                                BigDecimal loyaltyDiscount, BigDecimal taxAmount, BigDecimal totalAmount) {
        sale.setSubtotalAmount(subtotalAmount.doubleValue());
        sale.setDiscountAmount(discountAmount.doubleValue());
        sale.setTaxAmount(taxAmount.doubleValue());
        sale.setTotalAmount(totalAmount.doubleValue());
    }

    @Override
    public PagedResponse<SaleResponseDto> getAllSales(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Sale> sales = saleRepository.findAll(pageable);

        List<SaleResponseDto> content = sales.getContent().stream()
                .map(this::mapToSaleResponseDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                sales.getNumber(),
                sales.getSize(),
                sales.getTotalElements(),
                sales.getTotalPages(),
                sales.isLast()
        );
    }

    @Override
    public SaleResponseDto getSaleById(long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale", "id", id));
        return mapToSaleResponseDto(sale);
    }

    @Override
    public SalesReportDto getSalesReport(int pageNo, int pageSize, String sortBy, String sortDir, String search, LocalDate startDate, LocalDate endDate) {

            logger.info("Generating sales report for period: {} to {}", startDate, endDate);

            Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(pageNo, pageSize, sort);

            // Adjust dates to cover full days
            LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
            LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : null;

            // Fetch sales with date range and search
            Page<Sale> salesPage;
            if (startDateTime != null && endDateTime != null) {
                salesPage = saleRepository.findBySaleDateBetweenAndCustomerNameContainingIgnoreCase(
                        startDateTime, endDateTime, search, pageable);
            } else if (startDateTime != null) {
                salesPage = saleRepository.findBySaleDateAfterAndCustomerNameContainingIgnoreCase(
                        startDateTime, search, pageable);
            } else if (endDateTime != null) {
                salesPage = saleRepository.findBySaleDateBeforeAndCustomerNameContainingIgnoreCase(
                        endDateTime, search, pageable);
            } else {
                salesPage = search.isEmpty()
                        ? saleRepository.findAll(pageable)
                        : saleRepository.findByCustomerNameContainingIgnoreCase(search, pageable);
            }

            // Calculate aggregates
            List<Sale> sales = salesPage.getContent();
            BigDecimal totalSales = sales.stream()
                    .map(sale -> BigDecimal.valueOf(sale.getTotalAmount()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            long totalItemsSold = sales.stream()
                    .flatMap(sale -> sale.getSaleItems().stream())
                    .mapToLong(SaleItem::getQuantity)
                    .sum();
            BigDecimal averageSale = sales.isEmpty()
                    ? BigDecimal.ZERO
                    : totalSales.divide(BigDecimal.valueOf(sales.size()), 2, RoundingMode.HALF_UP);

            // Group by date
            Map<String, BigDecimal> salesByDate = sales.stream()
                    .collect(Collectors.groupingBy(
                            sale -> sale.getSaleDate().toLocalDate().toString(),
                            Collectors.reducing(
                                    BigDecimal.ZERO,
                                    sale -> BigDecimal.valueOf(sale.getTotalAmount()),
                                    BigDecimal::add
                            )
                    ));

            // Group by payment method
            Map<String, BigDecimal> salesByPayment = sales.stream()
                    .collect(Collectors.groupingBy(
                            Sale::getPaymentMethod,
                            Collectors.reducing(
                                    BigDecimal.ZERO,
                                    sale -> BigDecimal.valueOf(sale.getTotalAmount()),
                                    BigDecimal::add
                            )
                    ));

            // Group by customer
            Map<String, BigDecimal> salesByCustomer = sales.stream()
                    .filter(sale -> sale.getCustomer() != null)
                    .collect(Collectors.groupingBy(
                            sale -> sale.getCustomer().getName(),
                            Collectors.reducing(
                                    BigDecimal.ZERO,
                                    sale -> BigDecimal.valueOf(sale.getTotalAmount()),
                                    BigDecimal::add
                            )
                    ));

            // Map sales to DTOs
            List<SaleResponseDto> saleDtos = sales.stream()
                    .map(this::mapToSaleResponseDto)
                    .collect(Collectors.toList());

            // Build response
            SalesReportDto report = new SalesReportDto();
            report.setSales(saleDtos);
            report.setTotalSales(totalSales);
            report.setTotalItemsSold(totalItemsSold);
            report.setAverageSale(averageSale);
            report.setSalesByDate(salesByDate);
            report.setSalesByPaymentMethod(salesByPayment);
            report.setSalesByCustomer(salesByCustomer);
            report.setPageNo(salesPage.getNumber());
            report.setPageSize(salesPage.getSize());
            report.setTotalElements(salesPage.getTotalElements());
            report.setTotalPages(salesPage.getTotalPages());
            report.setLast(salesPage.isLast());

            return report;
        }

    private BigDecimal calculateDiscount(SaleRequestDto saleRequest, BigDecimal subtotal) {
        if (saleRequest.getDiscountPercentage() == null || saleRequest.getDiscountPercentage() <= 0) {
            return BigDecimal.ZERO;
        }
        return subtotal.multiply(
                BigDecimal.valueOf(saleRequest.getDiscountPercentage() / 100)
        ).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateLoyaltyDiscount(SaleRequestDto saleRequest, Customer customer, String currency) {
        if (customer == null || saleRequest.getUseLoyaltyPoints() == null ||
                saleRequest.getUseLoyaltyPoints() <= 0) {
            return BigDecimal.ZERO;
        }

        int pointsToUse = Math.min(saleRequest.getUseLoyaltyPoints(), customer.getLoyaltyPoints());
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() - pointsToUse);
        return convertCurrency(BigDecimal.valueOf(pointsToUse), "KES", currency);
    }

    private BigDecimal calculateTax(SaleRequestDto saleRequest, BigDecimal subtotal) {
        if (saleRequest.getTaxPercentage() == null || saleRequest.getTaxPercentage() <= 0) {
            return BigDecimal.ZERO;
        }
        return subtotal.multiply(
                BigDecimal.valueOf(saleRequest.getTaxPercentage() / 100)
        ).setScale(2, RoundingMode.HALF_UP);
    }

    private String validateAndFormatPhoneNumber(String phoneNumber, Customer customer) {
        if (phoneNumber == null && customer != null) {
            phoneNumber = customer.getPhoneNumber();
        }

        if (phoneNumber == null) {
            throw new SaleProcessingException("Phone number is required for M-Pesa payment");
        }

        if (!phoneNumber.startsWith("254")) {
            phoneNumber = "254" + phoneNumber.substring(1);
        }

        return phoneNumber;
    }

    private void updateCustomerLoyaltyPoints(Customer customer, BigDecimal subtotalAmount,
                                             String currency, Integer usedPoints) {
        BigDecimal subtotalInKES = convertCurrency(subtotalAmount, currency, "KES");
        int pointsEarned = subtotalInKES.divide(BigDecimal.valueOf(100), RoundingMode.FLOOR).intValue();
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() + pointsEarned);
        customerRepository.save(customer);
    }

    private void logSaleItems(Sale sale) {
        for (SaleItem saleItem : sale.getSaleItems()) {
            saleItemService.logSaleItemCreation(saleItem);
        }
    }

    private void logAudit(Sale sale, String currency, Transaction transaction) {
        AuditLog log = new AuditLog();
        log.setEntityType("Sale");
        log.setEntityId(sale.getId());
        log.setAction("CREATE");
        log.setUser(SecurityContextHolder.getContext().getAuthentication().getName());
        log.setTimestamp(LocalDateTime.now());

        String details = "Created sale with total amount: " + sale.getTotalAmount() + " " + currency;
        if (transaction != null) {
            details += ", M-Pesa Transaction ID: " + transaction.getTransactionId();
        }

        log.setDetails(details);
        auditLogRepository.save(log);
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

    private BigDecimal calculateItemTotal(int quantity, BigDecimal unitPrice) {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    private BigDecimal convertCurrency(BigDecimal amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equals(toCurrency)) return amount;

        Map<String, BigDecimal> exchangeRates = new HashMap<>();
        exchangeRates.put("KES-USD", BigDecimal.valueOf(0.0078));
        exchangeRates.put("USD-KES", BigDecimal.valueOf(128.50));

        String key = fromCurrency + "-" + toCurrency;
        if (exchangeRates.containsKey(key)) {
            return amount.multiply(exchangeRates.get(key)).setScale(2, RoundingMode.HALF_UP);
        }

        throw new IllegalArgumentException("Unsupported currency conversion: " + fromCurrency + " to " + toCurrency);
    }
}