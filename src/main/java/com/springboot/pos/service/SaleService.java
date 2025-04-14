package com.springboot.pos.service;

import com.springboot.pos.payload.*;

public interface SaleService {
    SaleResponseDto processSale(SaleRequestDto saleRequest);
//    SaleResponseDto  createSale(SaleResponseDto  saleDto);
    PagedResponse<SaleResponseDto > getAllSales(int pageNo, int pageSize, String sortBy, String sortDir);
    SaleResponseDto  getSaleById(long id);
}
