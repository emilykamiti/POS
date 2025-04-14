package com.springboot.pos.service.impl;

import com.springboot.pos.exception.ResourceNotFoundException;
import com.springboot.pos.model.Customer;
import com.springboot.pos.payload.CustomerDto;
import com.springboot.pos.payload.PagedResponse;
import com.springboot.pos.repository.CustomerRepository;
import com.springboot.pos.service.CustomerService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
@Service
public class CustomerServiceImpl implements CustomerService {

    private CustomerRepository customerRepository;
    private ModelMapper mapper;

    public CustomerServiceImpl(CustomerRepository customerRepository, ModelMapper mapper) {
        this.customerRepository = customerRepository;
        this.mapper = mapper;
    }


    @Override
    public CustomerDto createCustomers(CustomerDto customerDto) {
        Customer customer = mapToEntity(customerDto);
        Customer newCustomer = customerRepository.save(customer);

        //convert entity to DTO
        CustomerDto customerResponse = mapToDTO(newCustomer);
        return customerResponse;
    }
    @Override
    public PagedResponse<CustomerDto> getAllCustomers(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Customer> customers = customerRepository.findAll(pageable);

        List<CustomerDto> content = customers.getContent()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        PagedResponse<CustomerDto> customerResponse = new PagedResponse<>();
        customerResponse.setContent(content);
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
        Customer customer = customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        customer.setName(customerDto.getName());
        customer.setEmail(customerDto.getEmail());
        customer.setLoyaltyPoints(customerDto.getLoyaltyPoints());
        customer.setPhone(customerDto.getPhone());
        customer.setCreatedAt(customerDto.getCreatedAt());

        Customer updatedCustomer = customerRepository.save(customer);
        return mapToDTO(updatedCustomer);
    }

    @Override
    public void deleteCustomerById(long id) {
        Customer customer = customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("customer", "id", id));
        customerRepository.delete(customer);
    }

    private CustomerDto mapToDTO(Customer customer) {
        CustomerDto customerDto = mapper.map(customer, CustomerDto.class);
        return customerDto;
    }

    private Customer mapToEntity(CustomerDto customerDto) {
        Customer customer = mapper.map(customerDto, Customer.class);
        return customer;
    }
}
