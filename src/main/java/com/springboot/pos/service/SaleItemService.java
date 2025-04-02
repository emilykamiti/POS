package com.springboot.pos.service;

import com.springboot.pos.model.SaleItem;
import com.springboot.pos.payload.ProductDto;
import com.springboot.pos.payload.SaleItemDto;
import com.springboot.pos.payload.SaleItemResponse;

public interface SaleItemService {
    SaleItemDto createSaleItem(SaleItemDto saleItemDto);

    SaleItemResponse getAllSaleItems(int pageNo, int pageSize, String sortBy, String sortDir);
    SaleItemDto getSaleItemById(long id);
}
