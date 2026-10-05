const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export async function apiRequest(endpoint, options = {}) {
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  };

  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || 'Something went wrong'
    };
  }

  return data;
}

// ---------- Product APIs ----------

// GET /products?search=...&category=...&sort=...
export function getProducts(search, category, sort) {
  const params = new URLSearchParams();

  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (sort) params.append('sort', sort);

  return apiRequest(`/products?${params.toString()}`);
}

// GET /products/:id
export function getProductById(id) {
  return apiRequest(`/products/${id}`);
}
