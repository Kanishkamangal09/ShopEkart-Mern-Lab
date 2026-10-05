import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getWishlist } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import Icon from '../components/Icon';

function Products() {
  // the home page category cards link here as /products?category=Electronics
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ids of products the user has saved, so cards can show ♥ or ♡
  const [savedIds, setSavedIds] = useState([]);

  // load the wishlist once (not on every search)
  useEffect(() => {
    getWishlist()
      .then((data) => setSavedIds(data.wishlist.map((product) => product._id)))
      .catch((err) => console.error('Could not load wishlist', err));
  }, []);

  // called by a card after it adds/removes a product
  const handleWishlistChange = (productId, saved) => {
    setSavedIds((prev) =>
      saved ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  };

  // runs every time search, category or sort changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getProducts(search, category, sort);
        setProducts(data.products);
      } catch (err) {
        console.error(err);
        setError('Something went wrong while loading products.');
      } finally {
        setLoading(false);
      }
    };

    // wait until the user stops typing for 400ms, so we don't call the API on every key press
    const timer = setTimeout(fetchProducts, 400);
    return () => clearTimeout(timer);
  }, [search, category, sort]);

  return (
    <div className="container page">
      <div className="page-head">
        <h1>All Products</h1>
        <p className="muted">Browse our catalogue and find something you like.</p>
      </div>

      <SearchBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
      />

      {loading && <Loader text="Loading products..." />}

      {!loading && error && (
        <div className="empty-state">
          <h3>Oops!</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <Icon name="search" size={36} />
          <h3>No products found.</h3>
          <p>Try a different search or category.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <p className="muted result-count">{products.length} products found</p>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                saved={savedIds.includes(product._id)}
                onWishlistChange={handleWishlistChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Products;
