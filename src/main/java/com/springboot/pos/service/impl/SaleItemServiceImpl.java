package com.springboot.pos.service.impl;

import com.springboot.pos.exception.ResourceNotFoundException;
import com.springboot.pos.model.Sale;
import com.springboot.pos.model.SaleItem;
import com.springboot.pos.payload.*;
import com.springboot.pos.repository.SaleItemRepository;
import com.springboot.pos.repository.SupplierRepository;
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

    private SaleItemRepository saleItemRepository;
    private ModelMapper mapper;

    public SaleItemServiceImpl(SaleItemRepository saleItemRepository, ModelMapper mapper) {
        this.saleItemRepository = saleItemRepository;
        this.mapper = mapper;
    }

    @Override
    public SaleItemDto createSaleItem(SaleItemDto saleItemDto) {
        SaleItem saleItem = mapToEntity(saleItemDto);
        SaleItem newSaleItem= saleItemRepository.save(saleItem);

        //convert entity to DTO
        SaleItemDto saleItemResponse = mapToDTO(newSaleItem);
        return saleItemResponse;
    }

    @Override
    public SaleItemResponse getAllSaleItems(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<SaleItem> saleItems = saleItemRepository.findAll(pageable);

        // get content from page object
        List<SaleItem> listOfSaleItems= saleItems.getContent();
        List<SaleItemDto> content = listOfSaleItems.stream().map(saleItem -> mapToDTO(saleItem)).collect(Collectors.toList());
        SaleItemResponse saleItemResponse = new SaleItemResponse();
        saleItemResponse.setContent(content);
        saleItemResponse.setPageNo(saleItems.getNumber());
        saleItemResponse.setPageSize(saleItems.getSize());
        saleItemResponse.setTotalElements(saleItems.getTotalElements());
        saleItemResponse.setTotalPages(saleItems.getTotalPages());
        saleItemResponse.setLast(saleItems.isLast());

        return saleItemResponse;
    }

    @Override
    public SaleItemDto getSaleItemById(long id) {
        SaleItem saleItem = saleItemRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("SaleItem", "id", id));
        return mapToDTO(saleItem);
    }

    private SaleItemDto mapToDTO(SaleItem saleItem) {
        SaleItemDto saleItemDto = mapper.map(saleItem, SaleItemDto.class);
        return saleItemDto;
    }

    private SaleItem mapToEntity(SaleItemDto saleItemDto) {
        SaleItem saleItem = mapper.map(saleItemDto, SaleItem.class);
        return saleItem;
    }
}
