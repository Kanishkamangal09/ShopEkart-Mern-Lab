import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';
import { createPaymentOrder, verifyPayment } from '../services/api';
import { formatPrice } from '../data/categories';
import { loadRazorpayScript } from '../utils/loadRazorpay';
import { validateAddress } from '../utils/validateAddress';
import CheckoutForm from '../components/CheckoutForm';
import Loader from '../components/Loader';
import Icon from '../components/Icon';

const STEP_TEXT = {
  creating: 'Creating your order...',
  paying: 'Waiting for payment...',
  verifying: 'Verifying payment...'
};

function Checkout() {
  const { user } = useAuth();
  const { cartItems, loading, error, cartCount, subtotal, clearCart, refreshCart } = useCart();
  const navigate = useNavigate();

  // form state lives here (only this page needs it), pre-filled from the profile
  const [address, setAddress] = useState({
    fullName: user.fullName,
    phone: user.phone,
    addressLine1: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(''); // '' | 'creating' | 'paying' | 'verifying'
  const [message, setMessage] = useState('');

  const busy = step !== '';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    if (busy) return;

    // 1. check the form first, don't call the backend if it's invalid
    const formErrors = validateAddress(address);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setMessage('');
    setStep('creating');

    // 2. backend checks the cart + stock, calculates the total, creates the order + Razorpay order
    const shippingAddress = Object.fromEntries(
      Object.entries(address).map(([key, value]) => [key, value.trim()])
    );

    let data;
    try {
      data = await createPaymentOrder(shippingAddress);
    } catch (err) {
      setMessage(err.message);
      setStep('');
      // e.g. "Insufficient stock" -> reload the cart so it shows the latest stock
      if (err.status === 400) refreshCart();
      return;
    }

    // 3. load Razorpay's checkout script
    setStep('paying');
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setMessage('Could not load the payment window. Check your internet connection and try again.');
      setStep('');
      return;
    }

    // 4. open Razorpay Checkout
    let paymentFailed = false;

    const razorpay = new window.Razorpay({
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      order_id: data.razorpayOrderId,
      name: 'ShopKart',
      description: 'ShopKart Order',
      prefill: { name: shippingAddress.fullName, contact: shippingAddress.phone, email: user.email },
      theme: { color: '#f97316' },

      // Razorpay calls this after a successful payment.
      // It does NOT mean the payment is trusted yet: the backend must verify the signature.
      handler: async (response) => {
        setStep('verifying');
        try {
          const result = await verifyPayment({
            shopKartOrderId: data.shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          // 5. backend cart is already empty -> empty the shared cart state too (Navbar shows Cart 0)
          navigate(`/order-success/${result.order._id}`, { replace: true });
          clearCart();
        } catch (err) {
          setMessage(`Payment could not be verified (${err.message}). Your cart has not been cleared.`);
          setStep('');
        }
      },

      modal: {
        // user closed the Razorpay window
        ondismiss: () => {
          setStep('');
          if (!paymentFailed) {
            setMessage('Payment was cancelled. Your cart has not been cleared.');
          }
        }
      }
    });

    razorpay.on('payment.failed', (response) => {
      paymentFailed = true;
      setMessage(
        `Payment failed: ${response.error.description}. Your cart has not been cleared. Please try again.`
      );
    });

    razorpay.open();
  };

  if (loading) {
    return <Loader text="Loading checkout..." />;
  }

  if (error) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h3>{error}</h3>
          <button type="button" className="btn btn-primary" onClick={refreshCart}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // someone opened /checkout with an empty cart
  if (cartItems.length === 0) {
    return (
      <div className="container page">
        <div className="empty-state">
          <Icon name="cart" size={40} />
          <h3>Your cart is empty</h3>
          <p>Add some products before checking out.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const hasStockProblem = cartItems.some((item) => item.quantity > item.product.stock);

  return (
    <div className="container page">
      <div className="page-head">
        <Link to="/cart" className="back-link">
          <Icon name="arrowLeft" size={18} /> Back to cart
        </Link>
        <h1>Checkout</h1>
      </div>

      <form className="checkout-layout" onSubmit={handlePlaceOrder} noValidate>
        <section className="card">
          <h2 className="card-title">Shipping Details</h2>
          <p className="muted card-subtitle">Where should we deliver your order?</p>
          <CheckoutForm address={address} errors={errors} onChange={handleChange} disabled={busy} />
        </section>

        <aside className="card summary">
          <h2>Order Summary</h2>

          <ul className="checkout-items">
            {cartItems.map((item) => (
              <li key={item.product._id}>
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.product.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="summary-row">
            <span>Items</span>
            <span>{cartCount}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span className="text-success">Free</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {hasStockProblem && (
            <p className="summary-note">
              Some items are above the available stock. <Link to="/cart">Update your cart</Link>.
            </p>
          )}
          {message && <div className="alert alert-error">{message}</div>}

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy || hasStockProblem}>
            {busy ? STEP_TEXT[step] : `Place Order · ${formatPrice(subtotal)}`}
          </button>
          <p className="summary-small">
            <Icon name="shield" size={14} /> Payments are processed securely by Razorpay.
          </p>
        </aside>
      </form>
    </div>
  );
}

export default Checkout;
