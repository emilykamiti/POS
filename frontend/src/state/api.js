const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

const fetchWithAuth = async (
  endpoint,
  {
    method = 'GET',
    body,
    page = 0,
    pageSize = 10,
    sort = null,
    search = '',
    startDate = '',
    endDate = '',
    isMultipart = false,
  } = {},
  token
) => {
  let url = `${BASE_URL}/${endpoint}`;
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(!isMultipart && body && { 'Content-Type': 'application/json' }),
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
      body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'Unknown error' };
      }
      throw new Error(
        errorData.message ||
          `HTTP error! status: ${response.status}, endpoint: ${endpoint}`
      );
    }

    if (response.status !== 204) {
      return response.json();
    }
    return null;
  } catch (error) {
    throw new Error(`Network error at ${endpoint}: ${error.message}`);
  }
};

const api = {
  // --- Customers ---
  getCustomers: (params, token) =>
    fetchWithAuth('api/customers', { ...params }, token),
  createCustomer: (data, token) =>
    fetchWithAuth('api/customers', { method: 'POST', body: data }, token),
  updateCustomer: (id, data, token) =>
    fetchWithAuth(`api/customers/${id}`, { method: 'PUT', body: data }, token),
  deleteCustomer: (id, token) =>
    fetchWithAuth(`api/customers/${id}`, { method: 'DELETE' }, token),

  // --- Products ---
  getProducts: (params, token) =>
    fetchWithAuth('api/products', { ...params }, token),
  createProduct: (formData, token) =>
    fetchWithAuth('api/products', { method: 'POST', body: formData, isMultipart: true }, token),
  updateProduct: (id, formData, token) =>
    fetchWithAuth(`api/products/${id}`, { method: 'PUT', body: formData, isMultipart: true }, token),
  deleteProduct: (id, token) =>
    fetchWithAuth(`api/products/${id}`, { method: 'DELETE' }, token),

  // --- Categories ---
  getCategories: (params, token) =>
    fetchWithAuth('api/categories', { ...params }, token),

  // --- Suppliers ---
  getSuppliers: (params, token) =>
    fetchWithAuth('api/suppliers', { ...params }, token),

  // --- Transactions ---
  getTransactions: (params, token) =>
    fetchWithAuth('api/transactions', { ...params }, token),
  createTransaction: (data, token) =>
    fetchWithAuth('api/transactions', { method: 'POST', body: data }, token),
  getTransaction: (id, token) =>
    fetchWithAuth(`api/transactions/${id}`, {}, token),

  // --- Sales ---
  getSales: (params, token) =>
    fetchWithAuth('api/sales', { ...params }, token),
  createSale: (data, token) =>
    fetchWithAuth('api/sales', { method: 'POST', body: data }, token),
  getSale: (id, token) =>
    fetchWithAuth(`api/sales/${id}`, {}, token),

  // --- Sales Report ---
  getSalesReport: (params, token) =>
    fetchWithAuth('api/sales/report', { ...params }, token),

  // --- Users ---
  getUsers: (params, token) =>
    fetchWithAuth('api/users', { ...params }, token),
  createUser: (data, token) =>
    fetchWithAuth('api/users', { method: 'POST', body: data }, token),
  updateUser: (id, data, token) =>
    fetchWithAuth(`api/users/${id}`, { method: 'PUT', body: data }, token),
  deleteUser: (id, token) =>
    fetchWithAuth(`api/users/${id}`, { method: 'DELETE' }, token),

  // --- Auth ---
  login: (credentials) =>
    fetchWithAuth('api/auth/sign_in', { method: 'POST', body: credentials }),
  register: (userData) =>
    fetchWithAuth('api/auth/signup', { method: 'POST', body: userData }),
  refreshToken: () =>
    fetchWithAuth('api/auth/refresh', { method: 'POST' }),
  logout: (token) =>
    fetchWithAuth('api/auth/logout', { method: 'POST' }, token),
  verifyEmail: (token) =>
    fetchWithAuth(`api/auth/verify`, { method: 'GET', search: token }),
  getCurrentUser: (token) =>
    fetchWithAuth('api/auth/me', {}, token),
};

export default api;