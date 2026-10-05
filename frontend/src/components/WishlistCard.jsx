import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../data/categories';
import StockStatus from './StockStatus';
import Icon from './Icon';

function WishlistCard({ product, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');

  const handleRemove = async () => {
    if (removing) return;

    setRemoving(true);
    setError('');

    try {
      // onRemove is async; if it succeeds the parent removes this card from the list
      await onRemove(product._id);
    } catch {
      setError('Unable to remove product. Please try again.');
      setRemoving(false);
    }
  };

  return (
    <article className="product-card">
      <div className="product-media">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>

      <div className="product-body">
        <span className="product-category">{product.category}</span>
        <h3 className="product-title">{product.name}</h3>
        <div className="price-row">
          <strong>{formatPrice(product.price)}</strong>
        </div>
        <StockStatus stock={product.stock} />

        <div className="card-actions">
          <Link to={`/products/${product._id}`} className="btn btn-primary btn-block">
            View Details
          </Link>
          <button
            type="button"
            className="btn btn-outline btn-block btn-remove"
            onClick={handleRemove}
            disabled={removing}
          >
            <Icon name="heart" size={16} />
            {removing ? 'Removing...' : 'Remove from Wishlist'}
          </button>
          {error && <p className="wishlist-msg is-error">{error}</p>}
        </div>
      </div>
    </article>
  );
}

export default WishlistCard;
