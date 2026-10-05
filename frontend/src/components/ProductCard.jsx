import { Link } from 'react-router-dom';
import { formatPrice } from '../data/categories';
import StockStatus from './StockStatus';

function ProductCard({ product }) {
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

        <Link to={`/products/${product._id}`} className="btn btn-primary btn-block">
          View Details
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
