package com.springboot.pos.service;

import com.springboot.pos.payload.*;
import java.time.LocalDate;

public interface SaleService {
    SaleResponseDto processSale(SaleRequestDto saleRequest);
    PagedResponse<SaleResponseDto> getAllSales(int pageNo, int pageSize, String sortBy, String sortDir);
    SaleResponseDto getSaleById(long id);
    SalesReportDto getSalesReport(int pageNo, int pageSize, String sortBy, String sortDir, String search, LocalDate startDate, LocalDate endDate);
}