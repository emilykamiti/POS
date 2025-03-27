package com.springboot.pos.service.impl;

import com.springboot.pos.exception.ResourceNotFoundException;
import com.springboot.pos.model.Product;
import com.springboot.pos.model.Supplier;
import com.springboot.pos.payload.ProductDto;
import com.springboot.pos.payload.ProductResponse;
import com.springboot.pos.payload.SupplierDto;
import com.springboot.pos.payload.SupplierResponse;
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
    public SupplierResponse getAllSuppliers(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Supplier> suppliers = supplierRepository.findAll(pageable);

        // get content from page object
        List<Supplier> listOfSuppliers= suppliers.getContent();
        List<SupplierDto> content = listOfSuppliers.stream().map(supplier -> mapToDTO(supplier)).collect(Collectors.toList());
        SupplierResponse supplierResponse = new SupplierResponse();
        supplierResponse.setContent(content);
        supplierResponse.setPageNo(suppliers.getNumber());
        supplierResponse.setPageSize(suppliers.getSize());
        supplierResponse.setTotalElements(suppliers.getTotalElements());
        supplierResponse.setTotalPages(suppliers.getTotalPages());
        supplierResponse.setLast(suppliers.isLast());

        return supplierResponse;
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
