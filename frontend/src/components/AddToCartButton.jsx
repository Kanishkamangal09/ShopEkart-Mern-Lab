import { useState } from 'react';
import { useCart } from '../context/useCart';
import Icon from './Icon';

function AddToCartButton({ product, large = false }) {
  const { addToCart, getQuantity } = useCart();
  const [adding, setAdding] = useState(false); // loading state for THIS button only
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const inCart = getQuantity(product._id);
  const outOfStock = product.stock === 0;
  const reachedLimit = !outOfStock && inCart >= product.stock;

  const handleAdd = async () => {
    if (adding) return; // ignore extra clicks while saving

    setAdding(true);
    setMessage('');
    setIsError(false);

    try {
      await addToCart(product._id);
      setMessage('Added to cart');
    } catch (err) {
      setIsError(true);
      setMessage(err.message || 'Unable to add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  let label = 'Add to Cart';
  if (adding) label = 'Adding...';
  else if (outOfStock) label = 'Out of stock';
  else if (reachedLimit) label = 'Max quantity in cart';
  else if (inCart > 0) label = 'Add Another';

  return (
    <div className="cart-action">
      <button
        type="button"
        className={`btn btn-primary btn-block ${large ? 'btn-lg' : ''}`}
        onClick={handleAdd}
        disabled={adding || outOfStock || reachedLimit}
      >
        <Icon name="cart" size={18} />
        {label}
      </button>
      {inCart > 0 && !message && <p className="cart-msg">{inCart} in your cart</p>}
      {message && <p className={`cart-msg ${isError ? 'is-error' : ''}`}>{message}</p>}
    </div>
  );
}

export default AddToCartButton;
