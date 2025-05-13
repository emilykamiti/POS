const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080/api';

const fetchWithAuth = async (
  endpoint,
  { method = 'GET', body, page = 0, pageSize = 10, sort = null, search = '', startDate = '', endDate = '' } = {},
  token
) => {
  let url = `${BASE_URL}/${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  if (method === 'GET') {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(sort && { sortBy: sort.field, sortDir: sort.direction }),
      ...(search && { search }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });
    url += `?${params}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    throw new Error(`Network error: ${error.message}`);
  }
};

const api = {
  // --- Customers ---
  getCustomers: (params, token) => fetchWithAuth('customers', params, token),
  createCustomer: (data, token) =>
    fetchWithAuth('customers', { method: 'POST', body: JSON.stringify(data) }, token),
  updateCustomer: (id, data, token) =>
    fetchWithAuth(`customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
  deleteCustomer: (id, token) => fetchWithAuth(`customers/${id}`, { method: 'DELETE' }, token),

  // --- Products ---
  getProducts: (params, token) => fetchWithAuth('products', params, token),
  createProduct: (data, token) =>
    fetchWithAuth('products', { method: 'POST', body: JSON.stringify(data) }, token),
  updateProduct: (id, data, token) =>
    fetchWithAuth(`products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
  deleteProduct: (id, token) => fetchWithAuth(`products/${id}`, { method: 'DELETE' }, token),

  // --- Transactions ---
  getTransactions: (params, token) => fetchWithAuth('transactions', params, token),
  createTransaction: (data, token) =>
    fetchWithAuth('transactions', { method: 'POST', body: JSON.stringify(data) }, token),
  getTransaction: (id, token) => fetchWithAuth(`transactions/${id}`, {}, token),

  // --- Sales ---
  getSales: (params, token) => fetchWithAuth('sales', params, token),
  createSale: (data, token) =>
    fetchWithAuth('sales', { method: 'POST', body: JSON.stringify(data) }, token),
  getSale: (id, token) => fetchWithAuth(`sales/${id}`, {}, token),

  // --- Sales Report ---
  getSalesReport: (params, token) => fetchWithAuth('sales/report', params, token),

  // --- Users ---
  getUsers: (params, token) => fetchWithAuth('users', params, token),
  createUser: (data, token) =>
    fetchWithAuth('users', { method: 'POST', body: JSON.stringify(data) }, token),
  updateUser: (id, data, token) =>
    fetchWithAuth(`users/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
  deleteUser: (id, token) => fetchWithAuth(`users/${id}`, { method: 'DELETE' }, token),

  // --- Auth ---
  login: (credentials) =>
    fetchWithAuth('auth/sign_in', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) =>
    fetchWithAuth('auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  refreshToken: () => fetchWithAuth('auth/refresh', { method: 'POST' }),
  logout: (token) => fetchWithAuth('auth/logout', { method: 'POST' }, token),
};

export default api;