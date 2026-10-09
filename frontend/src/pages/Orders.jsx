import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/api';
import OrderCard from '../components/OrderCard';
import Loader from '../components/Loader';
import Icon from '../components/Icon';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await getOrders();
      setOrders(data.orders);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return <Loader text="Loading your orders..." />;
  }

  if (error) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h3>Unable to load your orders.</h3>
          <button type="button" className="btn btn-primary" onClick={loadOrders}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container page">
        <div className="empty-state">
          <Icon name="bag" size={40} />
          <h3>You have not placed any orders yet.</h3>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-head">
        <h1>My Orders</h1>
        <p className="muted">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </p>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
}

export default Orders;
