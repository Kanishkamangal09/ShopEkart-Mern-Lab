import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder } from '../services/api';
import { formatPrice } from '../data/categories';
import { formatDate } from '../utils/formatDate';
import OrderTracker from '../components/OrderStatus';
import Loader from '../components/Loader';
import Icon from '../components/Icon';

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrder(id)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message || 'Unable to load this order.'));
  }, [id]);

  if (error) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h3>{error}</h3>
          <Link to="/orders" className="btn btn-primary">
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return <Loader text="Loading order..." />;
  }

  const address = order.shippingAddress;

  return (
    <div className="container page">
      <div className="page-head">
        <Link to="/orders" className="back-link">
          <Icon name="arrowLeft" size={18} /> My Orders
        </Link>
        <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
        <p className="muted">Placed on {formatDate(order.createdAt)}</p>
      </div>

      <div className="card tracker-card">
        <OrderTracker status={order.status} />
      </div>

      <div className="cart-layout">
        <section className="card">
          <h2 className="card-title">Items</h2>
          {/* prices here are the SNAPSHOT saved when the order was placed */}
          <ul className="order-detail-items">
            {order.items.map((item) => (
              <li key={item.product}>
                <img src={item.image} alt="" />
                <div>
                  <Link to={`/products/${item.product}`}>{item.name}</Link>
                  <p className="muted">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </section>

        <aside className="card summary">
          <h2>Shipping Address</h2>
          <p className="address-block">
            <strong>{address.fullName}</strong>
            <br />
            {address.addressLine1}
            <br />
            {address.city}, {address.state} - {address.pincode}
            <br />
            Phone: {address.phone}
          </p>

          <h2>Payment</h2>
          <div className="summary-row">
            <span>Status</span>
            <span>{order.paymentStatus}</span>
          </div>
          {order.razorpayPaymentId && (
            <div className="summary-row">
              <span>Payment ID</span>
              <span className="mono">{order.razorpayPaymentId}</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default OrderDetails;
