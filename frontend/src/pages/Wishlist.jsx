import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../services/api';
import WishlistCard from '../components/WishlistCard';
import Loader from '../components/Loader';
import Icon from '../components/Icon';

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadWishlist = async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await getWishlist();
      setWishlist(data.wishlist);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // load once when the page opens
  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
    } catch (err) {
      // 404 = already removed (e.g. in another tab), so we can still hide the card
      if (err.status !== 404) throw err;
    }
    // remove the card from the screen without fetching the whole list again
    setWishlist((prev) => prev.filter((product) => product._id !== productId));
  };

  if (loading) {
    return <Loader text="Loading your wishlist..." />;
  }

  if (error) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h3>Something went wrong.</h3>
          <p>We couldn&apos;t load your wishlist.</p>
          <button type="button" className="btn btn-primary" onClick={loadWishlist}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container page">
        <div className="empty-state">
          <span className="empty-heart">
            <Icon name="heart" size={36} />
          </span>
          <h3>Your wishlist is empty</h3>
          <p>Save products you love and find them here later.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-head page-head-row">
        <div>
          <h1>My Wishlist</h1>
          <p className="muted">
            {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved
          </p>
        </div>
        <Link to="/products" className="btn btn-outline">
          Continue Shopping
        </Link>
      </div>

      <div className="product-grid">
        {wishlist.map((product) => (
          <WishlistCard key={product._id} product={product} onRemove={handleRemove} />
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
