const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080/api';

const api = {
  // --- Customers ---
  getCustomers: async ({ page, pageSize, sort, search }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sort: JSON.stringify(sort),
      search,
    });
    const response = await fetch(`${BASE_URL}/customers?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // --- Transactions ---
  getTransactions: async ({ page, pageSize, sort, search }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sort: JSON.stringify(sort),
      search,
    });
    const response = await fetch(`${BASE_URL}/transactions?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // --- Sales ---
  getSales: async ({ page, pageSize, sort, search }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sort: JSON.stringify(sort),
      search,
    });
    const response = await fetch(`${BASE_URL}/sales?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // --- Products ---
  getProducts: async ({ page, pageSize, sort, search }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sort: JSON.stringify(sort),
      search,
    });
    const response = await fetch(`${BASE_URL}/products?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // --- Users ---
  getUsers: async ({ page, pageSize, sort, search }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sort: JSON.stringify(sort),
      search,
    });
    const response = await fetch(`${BASE_URL}/users?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

export default api;