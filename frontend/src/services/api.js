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

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, config);
  } catch {
    // fetch only throws when the server can't be reached at all (offline / server down)
    throw { status: 0, message: 'Unable to reach the server. Please try again.' };
  }
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

// ---------- Wishlist APIs (all need login, the cookie is sent automatically) ----------

// Tell the Navbar the new wishlist count (bonus). Every wishlist API response includes "count".
function updateWishlistCount(count) {
  window.dispatchEvent(new CustomEvent('wishlist-count', { detail: count }));
}

// GET /wishlist
export async function getWishlist() {
  const data = await apiRequest('/wishlist');
  updateWishlistCount(data.count);
  return data;
}

// POST /wishlist/:productId
export async function addToWishlist(productId) {
  const data = await apiRequest(`/wishlist/${productId}`, { method: 'POST' });
  updateWishlistCount(data.count);
  return data;
}

// DELETE /wishlist/:productId
export async function removeFromWishlist(productId) {
  const data = await apiRequest(`/wishlist/${productId}`, { method: 'DELETE' });
  updateWishlistCount(data.count);
  return data;
}

// ---------- Cart APIs (all need login). Every response returns the updated cart. ----------

// GET /cart
export function fetchCart() {
  return apiRequest('/cart');
}

// POST /cart/:productId  (adds 1)
export function addCartItem(productId) {
  return apiRequest(`/cart/${productId}`, { method: 'POST' });
}

// PATCH /cart/:productId  body: { quantity }
export function updateCartItem(productId, quantity) {
  return apiRequest(`/cart/${productId}`, { method: 'PATCH', body: { quantity } });
}

// DELETE /cart/:productId
export function removeCartItem(productId) {
  return apiRequest(`/cart/${productId}`, { method: 'DELETE' });
}
