package com.springboot.pos.service;


import com.springboot.pos.payload.SupplierDto;
import com.springboot.pos.payload.SupplierResponse;

public interface SupplierService {
    SupplierDto createSupplier(SupplierDto supplierDto);

    SupplierResponse getAllSuppliers(int pageNo, int pageSize, String sortBy, String sortDir);

//    SupplierDto getSupplierById(long id);
//
//    SupplierDto updateSupplier(SupplierDto supplierDto, long id);

    void deleteSupplierById(long id);
}
