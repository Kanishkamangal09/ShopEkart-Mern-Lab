import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';
import Icon from './Icon';
import Logo from './Logo';

function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
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

        <nav className="nav-actions">
          <NavLink to="/home" className="nav-link">
            Home
          </NavLink>
          <NavLink to="/products" className="nav-link">
            Products
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

export default Navbar;
