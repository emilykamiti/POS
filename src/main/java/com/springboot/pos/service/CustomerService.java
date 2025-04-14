package com.springboot.pos.service;


import com.springboot.pos.payload.CustomerDto;

import com.springboot.pos.payload.PagedResponse;

import java.awt.print.Pageable;


public interface CustomerService {

    CustomerDto createCustomers(CustomerDto customerDto);

    PagedResponse<CustomerDto> getAllCustomers(int pageNo, int pageSize, String sortBy, String sortDir);

    CustomerDto getCustomerById(long id);

    CustomerDto updateCustomer(CustomerDto customerDto, long id);

    void deleteCustomerById(long id);
}

