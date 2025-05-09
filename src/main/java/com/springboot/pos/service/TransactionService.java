package com.springboot.pos.service;
import com.springboot.pos.payload.PagedResponse;
import com.springboot.pos.payload.TransactionDto;

public interface TransactionService {
    PagedResponse<TransactionDto> getAllTransactions(int pageNo, int pageSize, String sortBy, String sortDir);

}
