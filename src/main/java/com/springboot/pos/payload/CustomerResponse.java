package com.springboot.pos.payload;



import java.util.List;

public class CustomerResponse {

    private List<CustomerDto> name;
    private int pageNo;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;
}
