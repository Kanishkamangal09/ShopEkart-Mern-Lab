import { Link } from 'react-router-dom';
import { formatPrice } from '../data/categories';
import { formatDate } from '../utils/formatDate';
import { StatusBadge } from './OrderStatus';

function OrderCard({ order }) {
  return (
    <article className="card order-card">
      <div className="order-card-head">
        <div>
          <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
          <p className="muted">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <ul className="order-items">
        {order.items.map((item) => (
          <li key={item.product}>
            <img src={item.image} alt="" />
            <span>
              {item.name} × {item.quantity}
            </span>
          </li>
        ))}
      </ul>

      <div className="order-card-foot">
        <strong>Total: {formatPrice(order.totalAmount)}</strong>
        <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
          View Details
        </Link>
      </div>
    </article>
  );
}

export default OrderCard;
