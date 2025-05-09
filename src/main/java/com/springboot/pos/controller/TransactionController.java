package com.springboot.pos.controller;

import com.springboot.pos.payload.PagedResponse;
import com.springboot.pos.payload.TransactionDto;
import com.springboot.pos.service.TransactionService;
import com.springboot.pos.utils.AppConstants;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public PagedResponse<TransactionDto> getAllTransactions(
            @RequestParam(value = "pageNo", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER, required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = AppConstants.DEFAULT_PAGE_SIZE, required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = AppConstants.DEFAULT_SORT_BY, required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstants.DEFAULT_SORT_DIRECTION, required = false) String sortDir
    ) {
        return transactionService.getAllTransactions(pageNo, pageSize, sortBy, sortDir);

    }


}
