import { useEffect, useState } from 'react';
import { useCart } from '../context/useCart';
import { formatPrice } from '../data/products';
import Icon from './Icon';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [added]);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
  };

  return (
    <article className="product-card">
      <div className="product-media">
        {imgFailed ? (
          <div className="img-fallback">{product.name.charAt(0)}</div>
        ) : (
          <img src={product.image} alt={product.name} loading="lazy" onError={() => setImgFailed(true)} />
        )}
        <span className="discount-tag">-{discount}%</span>
      </div>

      <div className="product-body">
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          <span className="rating">
            <Icon name="star" size={14} /> {product.rating}
          </span>
        </div>
        <h3 className="product-title">{product.name}</h3>
        <div className="price-row">
          <strong>{formatPrice(product.price)}</strong>
          <s>{formatPrice(product.oldPrice)}</s>
        </div>
        <button
          type="button"
          className={`btn btn-block ${added ? 'btn-success' : 'btn-primary'}`}
          onClick={handleAdd}
        >
          <Icon name={added ? 'check' : 'cart'} size={18} />
          {added ? 'Added' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
