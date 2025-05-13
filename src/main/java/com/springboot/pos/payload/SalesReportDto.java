// src/main/java/com/springboot/pos/payload/SalesReportDto.java
package com.springboot.pos.payload;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class SalesReportDto {
    private List<SaleResponseDto> sales;
    private BigDecimal totalSales;
    private long totalItemsSold;
    private BigDecimal averageSale;
    private Map<String, BigDecimal> salesByDate;
    private Map<String, BigDecimal> salesByPaymentMethod;
    private Map<String, BigDecimal> salesByCustomer;
    private int pageNo;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;
}