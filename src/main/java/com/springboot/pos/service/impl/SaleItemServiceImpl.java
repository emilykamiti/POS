package com.springboot.pos.service.impl;

import com.springboot.pos.exception.ResourceNotFoundException;
import com.springboot.pos.model.*;
import com.springboot.pos.payload.*;
import com.springboot.pos.repository.*;
import com.springboot.pos.service.SaleItemService;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SaleItemServiceImpl implements SaleItemService {

    private static final Logger logger = LoggerFactory.getLogger(SaleItemServiceImpl.class);

    private final SaleItemRepository saleItemRepository;
    private final ProductRepository productRepository;
    private final ModelMapper mapper;
    private final AuditLogRepository auditLogRepository;

    public SaleItemServiceImpl(
            SaleItemRepository saleItemRepository,
            ProductRepository productRepository,
            AuditLogRepository auditLogRepository,
            ModelMapper mapper
    ) {
        this.saleItemRepository = saleItemRepository;
        this.productRepository = productRepository;
        this.mapper = mapper;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional
    public SaleItemResponseDto createSaleItem(SaleItemResponseDto saleItemDto) {
        logger.info("Creating sale item for product ID: {}", saleItemDto.getProductId());
        SaleItem saleItem = prepareSaleItem(saleItemDto);
        SaleItem savedItem = saleItemRepository.save(saleItem);
        logSaleItemCreation(savedItem);
        return mapToDTO(savedItem);
    }

    @Override
    public SaleItem prepareSaleItem(SaleItemResponseDto saleItemDto) {
        SaleItem saleItem = new SaleItem();

        // Fetch product from repository to ensure it exists
        Product product = productRepository.findById(saleItemDto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", saleItemDto.getProductId()));

        saleItem.setProduct(product);
        saleItem.setQuantity(saleItemDto.getQuantity());
        saleItem.setUnitPrice(saleItemDto.getUnitPrice());
        saleItem.setTotalPrice(calculateTotalPrice(saleItemDto.getQuantity(), saleItemDto.getUnitPrice()));

        return saleItem;
    }

    @Override
    public void logSaleItemCreation(SaleItem saleItem) {
        AuditLog log = new AuditLog();
        log.setEntityType("SaleItem");
        log.setEntityId(saleItem.getId());
        log.setAction("CREATE");
        log.setUser(SecurityContextHolder.getContext().getAuthentication().getName());
        log.setTimestamp(LocalDateTime.now());
        log.setDetails(String.format(
                "Created sale item for product %s (ID: %d) with quantity %d",
                saleItem.getProduct().getName(),
                saleItem.getProduct().getId(),
                saleItem.getQuantity()
        ));
        auditLogRepository.save(log);
        logger.info("Logged creation of sale item ID: {}", saleItem.getId());
    }

    @Override
    public PagedResponse<SaleItemResponseDto> getAllSaleItems(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<SaleItem> saleItems = saleItemRepository.findAll(pageable);

        List<SaleItemResponseDto> content = saleItems.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                saleItems.getNumber(),
                saleItems.getSize(),
                saleItems.getTotalElements(),
                saleItems.getTotalPages(),
                saleItems.isLast()
        );
    }

    @Override
    public SaleItemResponseDto getSaleItemById(long id) {
        logger.debug("Fetching sale item with ID: {}", id);
        SaleItem saleItem = saleItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SaleItem", "id", id));
        return mapToDTO(saleItem);
    }

    private SaleItemResponseDto mapToDTO(SaleItem saleItem) {
        SaleItemResponseDto dto = new SaleItemResponseDto();
        dto.setId(saleItem.getId());
        dto.setProductId(saleItem.getProduct().getId());
        dto.setProductName(saleItem.getProduct().getName());
        dto.setQuantity(saleItem.getQuantity());
        dto.setUnitPrice(saleItem.getUnitPrice());
        dto.setTotalPrice(saleItem.getTotalPrice());
        return dto;
    }

    private BigDecimal calculateTotalPrice(int quantity, BigDecimal unitPrice) {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}