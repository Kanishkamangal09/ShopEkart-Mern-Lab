import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder } from '../services/api';
import { formatPrice } from '../data/categories';
import { StatusBadge } from '../components/OrderStatus';
import Loader from '../components/Loader';
import Icon from '../components/Icon';

function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrder(id)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message || 'Unable to load your order.'));
  }, [id]);

  if (error) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h3>{error}</h3>
          <Link to="/orders" className="btn btn-primary">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return <Loader text="Loading your order..." />;
  }

  const paid = order.paymentStatus === 'PAID';

  return (
    <div className="container page">
      <div className="card success-card">
        <span className={paid ? 'success-icon' : 'pending-icon'}>
          <Icon name={paid ? 'check' : 'refresh'} size={32} />
        </span>
        <h1>{paid ? 'Order Placed Successfully' : 'Payment Pending'}</h1>
        <p className="muted">
          {paid ? 'Your order has been saved successfully.' : 'We have not received the payment for this order yet.'}
        </p>

        <dl className="detail-list">
          <div>
            <dt>Order ID</dt>
            <dd className="mono">{order._id}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{formatPrice(order.totalAmount)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={order.status} />
            </dd>
          </div>
          {order.razorpayPaymentId && (
            <div>
              <dt>Payment ID</dt>
              <dd className="mono">{order.razorpayPaymentId}</dd>
            </div>
          )}
        </dl>

        <div className="success-actions">
          <Link to="/orders" className="btn btn-primary">
            View My Orders
          </Link>
          <Link to="/products" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
