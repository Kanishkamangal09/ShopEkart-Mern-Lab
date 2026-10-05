import { Link } from 'react-router-dom';
import { formatPrice } from '../data/categories';
import StockStatus from './StockStatus';
import WishlistButton from './WishlistButton';
import Icon from './Icon';

function ProductCard({ product, saved, onWishlistChange }) {
  return (
    <article className="product-card">
      <div className="product-media">
        <img src={product.image} alt={product.name} loading="lazy" />
        {saved && (
          <span className="saved-badge" title="In your wishlist">
            <Icon name="heart" size={16} />
          </span>
        )}
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
          <WishlistButton productId={product._id} saved={saved} onChange={onWishlistChange} />
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
