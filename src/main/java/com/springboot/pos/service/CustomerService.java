package com.springboot.pos.service;


import com.springboot.pos.payload.CustomerDto;
import com.springboot.pos.payload.CustomerResponse;
import com.springboot.pos.payload.ProductDto;
import com.springboot.pos.payload.ProductResponse;


public interface CustomerService {

    CustomerDto createCustomers(CustomerDto customerDto);

   CustomerResponse getAllCustomers(int pageNo, int pageSize, String sortBy, String sortDir);

    CustomerDto getCustomerById(long id);

    CustomerDto updateCustomer(CustomerDto customerDto, long id);

    void deleteCustomerById(long id);
}

