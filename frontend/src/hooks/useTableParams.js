// src/hooks/useTableParams.js
import { useState } from 'react';

const useTableParams = (initialPageSize = 20) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sort, setSort] = useState({ field: 'id', direction: 'asc' }); // Single object instead of array
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0); // Reset page on search
  };

  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(0); // Reset page on sort
  };

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
    search,
    setSearch,
    searchInput,
    setSearchInput,
    handleSearch,
    handleSort,
  };
};

export default useTableParams;