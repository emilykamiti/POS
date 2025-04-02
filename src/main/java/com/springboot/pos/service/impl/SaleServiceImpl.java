package com.springboot.pos.service.impl;

import com.springboot.pos.exception.ResourceNotFoundException;
import com.springboot.pos.model.*;
import com.springboot.pos.payload.*;
import com.springboot.pos.repository.CustomerRepository;
import com.springboot.pos.repository.SaleRepository;
import com.springboot.pos.repository.UserRepository;
import com.springboot.pos.service.SaleService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SaleServiceImpl implements SaleService {

    private UserRepository userRepository;
    private CustomerRepository customerRepository;
    private SaleRepository saleRepository;
    private ModelMapper mapper;

    public SaleServiceImpl(SaleRepository saleRepository, UserRepository userRepository, CustomerRepository customerRepository, ModelMapper mapper) {
        this.saleRepository = saleRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.mapper = mapper;
    }

    @Override
    public SaleDto createSale(SaleDto saleDto) {
        Sale sale = mapToEntity(saleDto);
        Sale newSale = saleRepository.save(sale);

        //convert entity to DTO
        SaleDto saleResponse = mapToDTO(newSale);
        return saleResponse;
    }

    @Override
    public SaleResponse getAllSales(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Sale> sales = saleRepository.findAll(pageable);

        // get content from page object
        List<Sale> listOfSales= sales.getContent();
        List<SaleDto> content = listOfSales.stream().map(sale -> mapToDTO(sale)).collect(Collectors.toList());
        SaleResponse saleResponse = new SaleResponse();
        saleResponse.setContent(content);
        saleResponse.setPageNo(sales.getNumber());
        saleResponse.setPageSize(sales.getSize());
        saleResponse.setTotalElements(sales.getTotalElements());
        saleResponse.setTotalPages(sales.getTotalPages());
        saleResponse.setLast(sales.isLast());

        return saleResponse;
    }

    @Override
    public SaleDto getSaleById(long id) {
        Sale sale = saleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Sale", "id", id));
        return mapToDTO(sale);
    }


    private SaleDto mapToDTO(Sale sale) {
        SaleDto saleDto = mapper.map(sale, SaleDto.class);

        // Convert User entity to UserDto
        if (sale.getUser() != null) {
            UserDto userDto = new UserDto();
            userDto.setId(sale.getUser().getId());
            userDto.setName(sale.getUser().getName());
            userDto.setUsername(sale.getUser().getUsername());
            userDto.setEmail(sale.getUser().getEmail());
            saleDto.setUser(userDto);  // Set full user details
        }

        // Convert Customer entity to CustomerDto
        if (sale.getCustomer() != null) {
            CustomerDto customerDto = new CustomerDto();
            customerDto.setId(sale.getCustomer().getId());
            customerDto.setName(sale.getCustomer().getName());
            customerDto.setEmail(sale.getCustomer().getEmail());
            customerDto.setPhone(sale.getCustomer().getPhone());
            customerDto.setCreatedAt(sale.getCustomer().getCreatedAt());
            saleDto.setCustomer(customerDto);  // Set full customer details
        }

        return saleDto;
    }


    private Sale mapToEntity(SaleDto saleDto) {
        Sale sale = mapper.map(saleDto, Sale.class);

        // Fetch the User from the database if userId is provided
        if (saleDto.getUser() != null && saleDto.getUser().getId() != null) {
            User user = userRepository.findById(saleDto.getUser().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", saleDto.getUser().getId()));
            sale.setUser(user);  // Set the full User entity
        }

        // Fetch the Customer from the database if customerId is provided
        if (saleDto.getCustomer() != null && saleDto.getCustomer().getId() != null) {
            Customer customer = customerRepository.findById(saleDto.getCustomer().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", saleDto.getCustomer().getId()));
            sale.setCustomer(customer);  // Set the full Customer entity
        }

        return sale;
    }

}
