package com.springboot.pos.service;

import com.springboot.pos.payload.*;

public interface SaleService {
    SaleResponseDto processSale(SaleRequestDto saleRequest);
    PagedResponse<SaleResponseDto > getAllSales(int pageNo, int pageSize, String sortBy, String sortDir);
    SaleResponseDto  getSaleById(long id);
}
