import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { categories, products } from '../data/products';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';

const highlights = [
  { icon: 'truck', title: 'Free delivery', text: 'On orders above ₹999' },
  { icon: 'refresh', title: 'Easy returns', text: '7-day return policy' },
  { icon: 'shield', title: 'Secure checkout', text: '100% protected payments' }
];

function Home() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const activeCategory = searchParams.get('category') || 'All';

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesQuery =
        !q || product.name.toLowerCase().includes(q) || product.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  const selectCategory = (name) => {
    const next = new URLSearchParams(searchParams);
    if (name === 'All') next.delete('category');
    else next.set('category', name);
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="container page">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">New season picks</span>
          <h1>
            Hi {user.fullName.split(' ')[0]}, find something <span className="text-accent">you&apos;ll love.</span>
          </h1>
          <p>Hand-picked electronics, fashion, home and beauty products at student-friendly prices.</p>
          <div className="hero-actions">
            <a href="#products" className="btn btn-primary btn-lg">
              Shop now
            </a>
            <Link to="/cart" className="btn btn-outline btn-lg">
              View cart
            </Link>
          </div>
        </div>
        <div className="hero-media">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1000&q=80"
            alt="Shopping bags and gifts"
            onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
          />
        </div>
      </section>

      <section className="highlights">
        {highlights.map((item) => (
          <div key={item.title} className="highlight">
            <span className="highlight-icon">
              <Icon name={item.icon} />
            </span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Browse</span>
            <h2>Shop by category</h2>
          </div>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              className={`category-card ${activeCategory === category.name ? 'is-active' : ''}`}
              onClick={() => {
                selectCategory(category.name);
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <img src={category.image} alt="" loading="lazy" />
              <span className="category-label">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section" id="products">
        <div className="section-head">
          <div>
            <span className="eyebrow">Best sellers</span>
            <h2>{query ? `Results for "${query}"` : 'Featured products'}</h2>
          </div>
          <span className="muted">{filteredProducts.length} items</span>
        </div>

        <div className="chip-row">
          {['All', ...categories.map((c) => c.name)].map((name) => (
            <button
              key={name}
              type="button"
              className={`chip ${activeCategory === name ? 'is-active' : ''}`}
              onClick={() => selectCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Icon name="search" size={36} />
            <h3>No products found</h3>
            <p>Try a different search term or category.</p>
            <button type="button" className="btn btn-outline" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
