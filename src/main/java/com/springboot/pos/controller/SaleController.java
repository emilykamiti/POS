package com.springboot.pos.controller;

import com.springboot.pos.payload.*;
import com.springboot.pos.service.SaleService;
import com.springboot.pos.utils.AppConstants;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("api/sales")
public class SaleController {
    private static final Logger logger = LoggerFactory.getLogger(SaleController.class);
    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

//    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<SaleResponseDto> processSale(@Valid @RequestBody SaleRequestDto saleRequest) {
        logger.info("Processing sale request with payment method: {}", saleRequest.getPaymentMethod());
        SaleResponseDto saleResponse = saleService.processSale(saleRequest);
        logger.info("Sale processed successfully with ID: {}", saleResponse.getId());
        return new ResponseEntity<>(saleResponse, HttpStatus.CREATED);
    }

    @GetMapping
    public PagedResponse<SaleResponseDto> getAllSales(
            @RequestParam(value = "pageNo", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER, required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = AppConstants.DEFAULT_PAGE_SIZE, required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = AppConstants.DEFAULT_SORT_BY, required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstants.DEFAULT_SORT_DIRECTION, required = false) String sortDir
    ) {
        return saleService.getAllSales(pageNo, pageSize, sortBy, sortDir);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleResponseDto> getSaleById(@PathVariable Long id) {
        SaleResponseDto saleResponse = saleService.getSaleById(id);
        return ResponseEntity.ok(saleResponse);
    }


    @GetMapping("/overview")
    public ResponseEntity<SalesReportDto> getSalesReport(
            @RequestParam(value = "pageNo", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER, required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = AppConstants.DEFAULT_PAGE_SIZE, required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = AppConstants.DEFAULT_SORT_BY, required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstants.DEFAULT_SORT_DIRECTION, required = false) String sortDir,
            @RequestParam(value = "search", defaultValue = "", required = false) String search,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        logger.info("Fetching sales report for period: {} to {}", startDate, endDate);
        try {
            SalesReportDto report = saleService.getSalesReport(pageNo, pageSize, sortBy, sortDir, search, startDate, endDate);
            logger.info("Sales report generated successfully with {} sales", report.getTotalElements());
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            logger.error("Failed to generate sales report: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate sales report: " + e.getMessage(), e);
        }
    }
}