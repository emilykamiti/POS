package com.springboot.pos.service;

import com.springboot.pos.payload.PagedResponse;
import com.springboot.pos.payload.SaleItemResponseDto;

public interface SaleItemService {
    SaleItemResponseDto createSaleItem(SaleItemResponseDto saleItemDto);
    PagedResponse<SaleItemResponseDto> getAllSaleItems(int pageNo, int pageSize, String sortBy, String sortDir);
    SaleItemResponseDto getSaleItemById(long id);
}