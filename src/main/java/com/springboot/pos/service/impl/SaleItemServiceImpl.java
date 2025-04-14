package com.springboot.pos.service.impl;

import com.springboot.pos.exception.ResourceNotFoundException;
import com.springboot.pos.model.SaleItem;
import com.springboot.pos.payload.PagedResponse;
import com.springboot.pos.payload.SaleItemResponseDto;
import com.springboot.pos.repository.ProductRepository;
import com.springboot.pos.repository.SaleItemRepository;
import com.springboot.pos.service.SaleItemService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SaleItemServiceImpl implements SaleItemService {


    private final SaleItemRepository saleItemRepository;
    private final ModelMapper mapper;

    public SaleItemServiceImpl(SaleItemRepository saleItemRepository,
                               ModelMapper mapper) {
        this.saleItemRepository = saleItemRepository;
        this.mapper = mapper;
    }

    @Override
    public SaleItemResponseDto createSaleItem(SaleItemResponseDto saleItemDto) {
        SaleItem saleItem = mapToEntity(saleItemDto);
        SaleItem newSaleItem = saleItemRepository.save(saleItem);
        return mapToDTO(newSaleItem);
    }

    @Override
    public PagedResponse<SaleItemResponseDto> getAllSaleItems(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<SaleItem> saleItems = saleItemRepository.findAll(pageable);

        List<SaleItemResponseDto> content = saleItems.getContent()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        PagedResponse<SaleItemResponseDto> saleItemResponse = new PagedResponse<>();
        saleItemResponse.setContent(content);
        saleItemResponse.setPageNo(saleItems.getNumber());
        saleItemResponse.setPageSize(saleItems.getSize());
        saleItemResponse.setTotalElements(saleItems.getTotalElements());
        saleItemResponse.setTotalPages(saleItems.getTotalPages());
        saleItemResponse.setLast(saleItems.isLast());


        return saleItemResponse;
    }

    @Override
    public SaleItemResponseDto getSaleItemById(long id) {
        SaleItem saleItem = saleItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SaleItem", "id", id));
        return mapToDTO(saleItem);
    }

    private SaleItemResponseDto mapToDTO(SaleItem saleItem) {
        SaleItemResponseDto saleItemDto = new SaleItemResponseDto();
        saleItemDto.setProductId(saleItem.getProduct().getId());
        saleItemDto.setProductName(saleItem.getProduct().getName());
        saleItemDto.setQuantity(saleItem.getQuantity());
        saleItemDto.setUnitPrice(saleItem.getUnitPrice());
        saleItemDto.setTotalPrice(saleItem.getTotalPrice());
        return saleItemDto;
    }

    //TRY INPUTTING A DIFFERENT METHOD HERE, ONE THAT IMPLEMENTS MAPTODTO!!1

    private SaleItem mapToEntity(SaleItemResponseDto saleItemDto) {
        SaleItem saleItem = mapper.map(saleItemDto, SaleItem.class);
        return saleItem;
    }

}