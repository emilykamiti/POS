package com.springboot.pos.controller;

import com.springboot.pos.payload.SaleDto;
import com.springboot.pos.payload.SaleItemDto;
import com.springboot.pos.payload.SaleItemResponse;
import com.springboot.pos.payload.SaleResponse;
import com.springboot.pos.service.SaleItemService;
import com.springboot.pos.service.SaleService;
import com.springboot.pos.utils.AppConstants;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/saleitems")
public class SaleItemController {

    private SaleItemService saleItemService;

    public SaleItemController(SaleItemService saleItemService) {
        this.saleItemService = saleItemService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<SaleItemDto> createSaleItem(@Valid @RequestBody SaleItemDto saleItemDto) {
        return new ResponseEntity<>(saleItemService.createSaleItem(saleItemDto), HttpStatus.CREATED);
    }

    @GetMapping
    public SaleItemResponse getAllSaleItems(
            @RequestParam(value = "pageNo", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER, required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = AppConstants.DEFAULT_PAGE_SIZE, required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = AppConstants.DEFAULT_SORT_BY, required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstants.DEFAULT_SORT_DIRECTION, required = false) String sortDir
    ) {
        return saleItemService.getAllSaleItems(pageNo, pageSize, sortBy, sortDir);

    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleItemDto> getSaleItemById(@PathVariable(name = "id") long id) {
        return ResponseEntity.ok(saleItemService.getSaleItemById(id));
    }
}
