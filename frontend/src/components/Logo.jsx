import { Link } from 'react-router-dom';
import Icon from './Icon';

function Logo({ to = '/home' }) {
  return (
    <Link to={to} className="logo">
      <span className="logo-mark">
        <Icon name="bag" size={18} />
      </span>
      <span>
        Shop<span className="logo-accent">Kart</span>
      </span>
    </Link>
  );
}

export default Logo;
