import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';
import { getWishlist } from '../services/api';
import Icon from './Icon';
import Logo from './Logo';

function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const [wishlistCount, setWishlistCount] = useState(0);

  // every wishlist API call sends a "wishlist-count" event with the new count from the backend
  useEffect(() => {
    const handleCount = (event) => setWishlistCount(event.detail);
    window.addEventListener('wishlist-count', handleCount);
    return () => window.removeEventListener('wishlist-count', handleCount);
  }, []);

  // get the starting count when a user logs in
  useEffect(() => {
    if (user) {
      getWishlist().catch(() => {});
    }
  }, [user]);

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

        <nav className="nav-actions">
          <NavLink to="/home" className="nav-link nav-home">
            Home
          </NavLink>
          <NavLink to="/products" className="nav-link">
            Products
          </NavLink>
          <NavLink to="/wishlist" className="nav-link">
            Wishlist{wishlistCount > 0 && <span className="nav-count">{wishlistCount}</span>}
          </NavLink>

          <NavLink to="/cart" className="nav-link">
            Cart{cartCount > 0 && <span className="nav-count nav-count-cart">{cartCount}</span>}
          </NavLink>
          <NavLink to="/orders" className="nav-link">
            Orders
          </NavLink>

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

export default Navbar;
