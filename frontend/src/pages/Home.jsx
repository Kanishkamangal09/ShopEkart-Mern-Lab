import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { categories } from '../data/categories';
import Icon from '../components/Icon';

const highlights = [
  { icon: 'truck', title: 'Free delivery', text: 'On orders above ₹999' },
  { icon: 'refresh', title: 'Easy returns', text: '7-day return policy' },
  { icon: 'shield', title: 'Secure checkout', text: '100% protected payments' }
];

function Home() {
  const { user } = useAuth();

  return (
    <div className="container page">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">New season picks</span>
          <h1>
            Hi {user.fullName.split(' ')[0]}, find something <span className="text-accent">you&apos;ll love.</span>
          </h1>
          <p>Electronics, fashion, books and home products at prices you will love.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">
              Shop now
            </Link>
            <Link to="/cart" className="btn btn-outline btn-lg">
              View cart
            </Link>
          </div>
        </div>
        <div className="hero-media">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1000&q=80"
            alt="Shopping bags and gifts"
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
          <Link to="/products" className="btn btn-outline btn-sm">
            View all products
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="category-card"
            >
              <img src={category.image} alt="" loading="lazy" />
              <span className="category-label">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
