package com.springboot.pos.service;


import com.springboot.pos.payload.PagedResponse;
import com.springboot.pos.payload.SupplierDto;

public interface SupplierService {
    SupplierDto createSupplier(SupplierDto supplierDto);
    PagedResponse<SupplierDto> getAllSuppliers(int pageNo, int pageSize, String sortBy, String sortDir);
    void deleteSupplierById(long id);
}
