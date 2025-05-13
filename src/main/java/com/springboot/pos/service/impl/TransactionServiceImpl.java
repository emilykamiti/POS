package com.springboot.pos.service.impl;
import com.springboot.pos.exception.ResourceNotFoundException;
import com.springboot.pos.model.Supplier;
import com.springboot.pos.payload.SupplierDto;
import lombok.Builder;
import com.springboot.pos.model.Transaction;
import com.springboot.pos.payload.PagedResponse;
import com.springboot.pos.payload.TransactionDto;
import com.springboot.pos.repository.TransactionRepository;
import com.springboot.pos.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final ModelMapper mapper;

    public TransactionServiceImpl(TransactionRepository transactionRepository, ModelMapper mapper) {
        this.transactionRepository = transactionRepository;
        this.mapper = mapper;
    }

    @Override
    public PagedResponse<TransactionDto> getAllTransactions(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Transaction> transactions = transactionRepository.findAll(pageable);

        List<TransactionDto> content = transactions.getContent()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        PagedResponse<TransactionDto> productresponse = new PagedResponse<>();
        productresponse.setContent(content);
        productresponse.setPageNo(transactions.getNumber());
        productresponse.setPageSize(transactions.getSize());
        productresponse.setTotalElements(transactions.getTotalElements());
        productresponse.setTotalPages(transactions.getTotalPages());
        productresponse.setLast(transactions.isLast());

        return productresponse;
    }

    private TransactionDto mapToDTO(Transaction transaction) {
        TransactionDto transactionDto = mapper.map(transaction, TransactionDto.class);
        return transactionDto;
    }

    private Transaction mapToEntity(TransactionDto transactionDto) {
        Transaction transaction = mapper.map(transactionDto, Transaction.class);
        return transaction;
    }

}