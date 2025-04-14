package com.springboot.pos.service.impl;

import com.springboot.pos.exception.ResourceNotFoundException;
import com.springboot.pos.model.Supplier;
import com.springboot.pos.payload.PagedResponse;
import com.springboot.pos.payload.SupplierDto;
import com.springboot.pos.repository.SupplierRepository;
import com.springboot.pos.service.SupplierService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
@Service
public class SupplierServiceImpl implements SupplierService {
    private SupplierRepository supplierRepository;
    private ModelMapper mapper;

    public SupplierServiceImpl(SupplierRepository supplierRepository, ModelMapper mapper) {
        this.supplierRepository = supplierRepository;
        this.mapper = mapper;
    }


    @Override
    public SupplierDto createSupplier(SupplierDto supplierDto) {
        Supplier supplier = mapToEntity(supplierDto);
        Supplier newSupplier = supplierRepository.save(supplier);

        //convert entity to DTO
        SupplierDto supplierResponse = mapToDTO(newSupplier);
        return supplierResponse;
    }

    @Override
    public PagedResponse<SupplierDto> getAllSuppliers(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Supplier> suppliers = supplierRepository.findAll(pageable);

        List<SupplierDto> content = suppliers.getContent()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        PagedResponse<SupplierDto> productresponse = new PagedResponse<>();
        productresponse.setContent(content);
        productresponse.setPageNo(suppliers.getNumber());
        productresponse.setPageSize(suppliers.getSize());
        productresponse.setTotalElements(suppliers.getTotalElements());
        productresponse.setTotalPages(suppliers.getTotalPages());
        productresponse.setLast(suppliers.isLast());

        return productresponse;
    }


    @Override
    public void deleteSupplierById(long id) {
        Supplier supplier = supplierRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        supplierRepository.delete(supplier);
    }

    private SupplierDto mapToDTO(Supplier supplier) {
        SupplierDto supplierDto = mapper.map(supplier, SupplierDto.class);
        return supplierDto;
    }

    private Supplier mapToEntity(SupplierDto supplierDto) {
        Supplier supplier = mapper.map(supplierDto, Supplier.class);
        return supplier;
    }
}
