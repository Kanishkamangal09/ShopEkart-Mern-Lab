import { useCallback, useEffect, useState } from 'react';
import { addCartItem, fetchCart, removeCartItem, updateCartItem } from '../services/api';
import { useAuth } from './useAuth';
import { CartContext } from './useCart';

// One shared cart for the whole app (Navbar, Product cards, Cart page all read from here).
// The real cart lives in MongoDB; this state is just the frontend copy of it.
export function CartProvider({ children }) {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // load the cart from the backend
  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchCart();
      setCartItems(data.cart);
    } catch (err) {
      console.error(err);
      setError('Unable to load your cart.');
    } finally {
      setLoading(false);
    }
  }, []);

  // load the cart when someone logs in, empty it when they log out
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [user, refreshCart]);

  // Every cart API returns the updated cart, so we just replace our copy with it.
  // If the API fails, the error is thrown to the component that called it (it shows the message).
  const addToCart = async (productId) => {
    const data = await addCartItem(productId);
    setCartItems(data.cart);
  };

  const updateQuantity = async (productId, quantity) => {
    const data = await updateCartItem(productId, quantity);
    setCartItems(data.cart);
  };

  const removeFromCart = async (productId) => {
    const data = await removeCartItem(productId);
    setCartItems(data.cart);
  };

  // ---- derived values: calculated from cartItems, never stored ----
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const getQuantity = (productId) => {
    const item = cartItems.find((cartItem) => cartItem.product._id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        cartCount,
        subtotal,
        getQuantity,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
