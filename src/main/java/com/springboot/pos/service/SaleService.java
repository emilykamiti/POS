package com.springboot.pos.service;

import com.springboot.pos.payload.*;

public interface SaleService {
    SaleDto createSale(SaleDto saleDto);

    SaleResponse getAllSales(int pageNo, int pageSize, String sortBy, String sortDir);
    SaleDto getSaleById(long id);
}
