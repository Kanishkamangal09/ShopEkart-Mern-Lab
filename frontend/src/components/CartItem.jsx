import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { formatPrice } from '../data/categories';
import Icon from './Icon';

function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  // busy/error only for this row, so other rows stay usable
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const outOfStock = product.stock === 0;
  const tooMany = quantity > product.stock; // stock went down after it was added

  const run = async (action) => {
    if (busy) return;
    setBusy(true);
    setError('');

    try {
      await action();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // if stock dropped below the cart quantity, "-" jumps straight down to the stock
  const decrease = () => run(() => updateQuantity(product._id, Math.min(quantity - 1, product.stock)));
  const increase = () => run(() => updateQuantity(product._id, quantity + 1));
  const remove = () => run(() => removeFromCart(product._id));

  return (
    <div className={`cart-item ${busy ? 'is-busy' : ''}`}>
      <Link to={`/products/${product._id}`}>
        <img src={product.image} alt={product.name} className="cart-thumb" />
      </Link>

      <div className="cart-info">
        <span className="product-category">{product.category}</span>
        <h3>
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h3>
        <strong>{formatPrice(product.price)}</strong>
        {outOfStock && <p className="cart-warning">Out of stock. Please remove it.</p>}
        {!outOfStock && tooMany && (
          <p className="cart-warning">Only {product.stock} left. Please reduce the quantity.</p>
        )}
        {error && <p className="cart-warning">{error}</p>}
      </div>

      <div className="qty">
        <button
          type="button"
          onClick={decrease}
          disabled={busy || quantity <= 1 || outOfStock}
          aria-label="Decrease quantity"
        >
          <Icon name="minus" size={16} />
        </button>
        <span>{quantity}</span>
        <button
          type="button"
          onClick={increase}
          disabled={busy || quantity >= product.stock}
          aria-label="Increase quantity"
        >
          <Icon name="plus" size={16} />
        </button>
      </div>

      <strong className="cart-line-total">{formatPrice(product.price * quantity)}</strong>

      <button type="button" className="btn btn-ghost btn-sm cart-remove" onClick={remove} disabled={busy}>
        <Icon name="trash" size={16} />
        Remove
      </button>
    </div>
  );
}

export default CartItem;
