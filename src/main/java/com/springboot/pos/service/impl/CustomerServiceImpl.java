package com.springboot.pos.service.impl;

import com.springboot.pos.exception.ResourceNotFoundException;
import com.springboot.pos.model.Product;
import com.springboot.pos.payload.CustomerDto;
import com.springboot.pos.payload.CustomerResponse;
import com.springboot.pos.payload.ProductDto;
import com.springboot.pos.repository.CustomerRepository;
import com.springboot.pos.service.CustomerService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.stream.Collectors;

public class CustomerServiceImpl implements CustomerService {
    private ModelMapper mapper;
    private CustomerRepository customerRepository;

    public CustomerServiceImpl(ModelMapper mapper, CustomerRepository customerRepository) {
        this.mapper = mapper;
        this.customerRepository = customerRepository;
    }


    @Override
    public CustomerDto createCustomer(CustomerDto customerDto) {
        Customer customer = maptoEntity(customerDto);
        Customer newCustomer = customerRepository.save(customer);

        CustomerDto customerResponse = mapToDTO(newCustomer);
        return null;
    }

    @Override
    public CustomerResponse getAllCustomers(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Customer> customers = customerRepository.findAll(pageable);


        // get content from page object
        List<Customer> listOfCustomers = customers.getContent();
        List<ProductDto> name = listOfCustomers.stream().map(product -> mapToDTO(customer)).collect(Collectors.toList());
        CustomerResponse customerResponse = new CustomerResponse();
        customerResponse.setName(name);
        customerResponse.setPageNo(customers.getNumber());
        customerResponse.setPageSize(customers.getSize());
        customerResponse.setTotalElements(customers.getTotalElements());
        customerResponse.setTotalPages(customers.getTotalPages());
        customerResponse.setLast(customers.isLast());

        return customerResponse;
    }

    @Override
    public CustomerDto getCustomerById(long id) {
        Customer customer = customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return mapToDTO(customer);

    }

    @Override
    public CustomerDto updateCustomer(CustomerDto customerDto, long id) {
        Customer customer = customer.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        customer.setName(customerDto.getName());
        customer.setBarcode(customerDto.getBarcode());
        customer.setPrice(customerDto.getPrice());
        customerDto.setStock(customerDto.getStock());
        customerDto.setCategory(customerDto.getCategory());
        customerDto.setSupplier(customerDto.getSupplier());
        customerDto.setCategory(customerDto.getCategory());
        customerDto.setCreatedAt(customerDto.getUpdatedAt());
        Customer updatedCustomer = customerRepository.save(customer);
        return mapToDTO(updatedCustomer);
    }

    @Override
    public void deleteCustomerById(long id) {
        Customer customer = customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        customerRepository.delete(customer);
    }

    // convert entity into DTO
    private CustomerDto mapToDTO(Customer customer) {
        CustomerDto customerDto = mapper.map(customer, CustomerDto.class);

        return customerDto;
    }

    //convert DTO into entity
    private Customer maptoEntity(CustomerDto customerDto) {
        Customer customer = mapper.map(customerDto, Customer.class);
        return customer;

    }
}
