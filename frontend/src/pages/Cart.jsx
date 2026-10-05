import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { formatPrice } from '../data/products';
import Icon from '../components/Icon';

const FREE_SHIPPING_LIMIT = 999;
const SHIPPING_FEE = 49;

function Cart() {
  const { items, cartCount, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_FEE;
  const savings = items.reduce((sum, item) => sum + (item.oldPrice - item.price) * item.quantity, 0);
  const total = subtotal + shipping;

  const handleCheckout = () => {
    clearCart();
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="container page">
        <div className="empty-state card">
          <span className="success-icon">
            <Icon name="check" size={32} />
          </span>
          <h3>Order placed successfully!</h3>
          <p>Thanks for shopping with ShopKart. (This is a demo, no payment was taken.)</p>
          <Link to="/home" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container page">
        <div className="empty-state card">
          <Icon name="cart" size={40} />
          <h3>Your cart is empty</h3>
          <p>Looks like you haven&apos;t added anything yet.</p>
          <Link to="/home" className="btn btn-primary">
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-head">
        <Link to="/home" className="back-link">
          <Icon name="arrowLeft" size={18} /> Continue shopping
        </Link>
        <h1>
          Shopping cart <span className="muted">({cartCount} items)</span>
        </h1>
      </div>

      <div className="cart-layout">
        <div className="card cart-list">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-thumb" />
              <div className="cart-info">
                <span className="product-category">{item.category}</span>
                <h3>{item.name}</h3>
                <div className="price-row">
                  <strong>{formatPrice(item.price)}</strong>
                  <s>{formatPrice(item.oldPrice)}</s>
                </div>
              </div>
              <div className="qty">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  <Icon name="minus" size={16} />
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Icon name="plus" size={16} />
                </button>
              </div>
              <strong className="cart-line-total">{formatPrice(item.price * item.quantity)}</strong>
              <button
                type="button"
                className="icon-btn icon-btn-danger"
                onClick={() => removeFromCart(item.id)}
                aria-label={`Remove ${item.name}`}
              >
                <Icon name="trash" size={18} />
              </button>
            </div>
          ))}
        </div>

        <aside className="card summary">
          <h2>Order summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? <span className="text-success">Free</span> : formatPrice(shipping)}</span>
          </div>
          <div className="summary-row text-success">
            <span>You save</span>
            <span>{formatPrice(savings)}</span>
          </div>
          {shipping > 0 && (
            <p className="summary-note">
              Add {formatPrice(FREE_SHIPPING_LIMIT - subtotal)} more for free delivery.
            </p>
          )}
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button type="button" className="btn btn-primary btn-block btn-lg" onClick={handleCheckout}>
            Place order
          </button>
          <button type="button" className="btn btn-ghost btn-block" onClick={clearCart}>
            Clear cart
          </button>
        </aside>
      </div>
    </div>
  );
}

export default Cart;
