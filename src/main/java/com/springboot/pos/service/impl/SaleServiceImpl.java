package com.springboot.pos.service.impl;

import com.springboot.pos.exception.ResourceNotFoundException;
import com.springboot.pos.model.Sale;
import com.springboot.pos.model.SaleItem;
import com.springboot.pos.payload.*;
import com.springboot.pos.repository.SaleRepository;
import com.springboot.pos.service.SaleService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final ModelMapper mapper;
    private final ProductServiceImpl productService;

    public SaleServiceImpl(
            SaleRepository saleRepository,
            ModelMapper mapper,
            ProductServiceImpl productService
    ) {
        this.saleRepository = saleRepository;
        this.mapper = mapper;
        this.productService = productService;
    }

    @Override
    //look at this again
    //made a small change here regarding product service, am supposed to use impl or just product service.
    public SaleResponseDto processSale(SaleRequestDto saleRequest) {
        return productService.processSale(saleRequest);
    }

    @Override
    public PagedResponse<SaleResponseDto> getAllSales(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Sale> sales = saleRepository.findAll(pageable);

        List<SaleResponseDto> content = sales.getContent()
                .stream()
                .map(this::mapToResponseDto)
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
        return mapToResponseDto(sale);
    }

    private SaleResponseDto mapToResponseDto(Sale sale) {
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
}