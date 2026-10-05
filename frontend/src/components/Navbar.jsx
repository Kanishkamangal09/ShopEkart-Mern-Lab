import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';
import Icon from './Icon';
import Logo from './Logo';

function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (isAuthPage || !user) {
    return (
      <header className="navbar">
        <div className="container navbar-inner">
          <Logo to="/login" />
          <nav className="nav-auth">
            <NavLink to="/login" className="btn btn-ghost btn-sm">
              Login
            </NavLink>
            <NavLink to="/register" className="btn btn-primary btn-sm">
              Sign up
            </NavLink>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Logo />

        {/* key resets the box when the URL query changes (e.g. "Clear filters") */}
        <SearchBox key={urlQuery} initialQuery={urlQuery} />

        <nav className="nav-actions">
          <NavLink to="/home" end className="nav-link">
            Home
          </NavLink>

          <Link to="/cart" className="icon-btn" aria-label={`Cart, ${cartCount} items`}>
            <Icon name="cart" />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>

          <Link to="/profile" className="avatar-link" title="My profile">
            <span className="avatar avatar-sm">{user.fullName.charAt(0).toUpperCase()}</span>
            <span className="avatar-name">{user.fullName.split(' ')[0]}</span>
          </Link>

          <button type="button" className="icon-btn" onClick={handleLogout} aria-label="Logout" title="Logout">
            <Icon name="logout" />
          </button>
        </nav>
      </div>
    </header>
  );
}

function SearchBox({ initialQuery }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (event) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/home?q=${encodeURIComponent(q)}#products` : '/home#products');
  };

  return (
    <form className="search-box" onSubmit={handleSearch} role="search">
      <Icon name="search" size={18} />
      <input
        type="search"
        placeholder="Search for products..."
        aria-label="Search products"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}

export default Navbar;
