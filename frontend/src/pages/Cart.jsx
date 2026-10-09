import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { formatPrice } from '../data/categories';
import CartItem from '../components/CartItem';
import Loader from '../components/Loader';
import Icon from '../components/Icon';

function Cart() {
  const { cartItems, loading, error, cartCount, subtotal, refreshCart } = useCart();

  if (loading) {
    return <Loader text="Loading your cart..." />;
  }

  if (error) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h3>Unable to load your cart.</h3>
          <p>Please check your connection and try again.</p>
          <button type="button" className="btn btn-primary" onClick={refreshCart}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container page">
        <div className="empty-state">
          <Icon name="cart" size={40} />
          <h3>Your cart is empty 🛒</h3>
          <p>Looks like you haven&apos;t added anything yet.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // checkout should not continue if any item is above the current stock
  const hasStockProblem = cartItems.some((item) => item.quantity > item.product.stock);

  return (
    <div className="container page">
      <div className="page-head">
        <Link to="/products" className="back-link">
          <Icon name="arrowLeft" size={18} /> Continue shopping
        </Link>
        <h1>My Cart</h1>
      </div>

      <div className="cart-layout">
        <div className="card cart-list">
          {cartItems.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>

        <aside className="card summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Items</span>
            <span>{cartCount}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {hasStockProblem && (
            <p className="summary-note">Some items are above the available stock. Please update them.</p>
          )}
          {hasStockProblem ? (
            <button type="button" className="btn btn-primary btn-block btn-lg" disabled>
              Proceed to Checkout
            </button>
          ) : (
            <Link to="/checkout" className="btn btn-primary btn-block btn-lg">
              Proceed to Checkout
            </Link>
          )}
          <p className="summary-small">Free delivery on every order.</p>
        </aside>
      </div>
    </div>
  );
}

export default Cart;
