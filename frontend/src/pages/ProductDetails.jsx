import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductById } from '../services/api';
import { formatPrice } from '../data/categories';
import StockStatus from '../components/StockStatus';
import AddToCartButton from '../components/AddToCartButton';
import Loader from '../components/Loader';
import Icon from '../components/Icon';

function ProductDetails() {
  // :id from the URL, e.g. /products/66d123abc456
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getProductById(id);
        setProduct(data.product);
      } catch (err) {
        // 400 = invalid id, 404 = not found -> show the backend message
        if (err.status === 400 || err.status === 404) {
          setError(err.message);
        } else {
          setError('Something went wrong while loading the product.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <Loader text="Loading product..." />;
  }

  if (error) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h3>{error}</h3>
          <Link to="/products" className="btn btn-primary">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <Link to="/products" className="back-link">
        <Icon name="arrowLeft" size={18} /> Back to products
      </Link>

      <div className="details-layout card">
        <div className="details-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="details-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="details-price">{formatPrice(product.price)}</p>
          <StockStatus stock={product.stock} />
          <p className="details-description">{product.description}</p>

          <div className="details-cart">
            <AddToCartButton product={product} large />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
