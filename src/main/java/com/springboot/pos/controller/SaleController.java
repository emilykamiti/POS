package com.springboot.pos.controller;

import com.springboot.pos.model.Sale;
import com.springboot.pos.payload.*;
import com.springboot.pos.service.SaleService;
import com.springboot.pos.service.SupplierService;
import com.springboot.pos.utils.AppConstants;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/sales")
public class SaleController {
    private SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<SaleDto> createSale(@Valid @RequestBody SaleDto saleDto) {
        return new ResponseEntity<>(saleService.createSale(saleDto), HttpStatus.CREATED);
    }

    @GetMapping
    public SaleResponse getAllSales(
            @RequestParam(value = "pageNo", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER, required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = AppConstants.DEFAULT_PAGE_SIZE, required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = AppConstants.DEFAULT_SORT_BY, required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstants.DEFAULT_SORT_DIRECTION, required = false) String sortDir
    ) {
        return saleService.getAllSales(pageNo, pageSize, sortBy, sortDir);

    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleDto> getSaleById(@PathVariable Long id) {
        SaleDto saleDto = saleService.getSaleById(id); // Directly returns SaleDto
        return ResponseEntity.ok(saleDto);
    }

}
