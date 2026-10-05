import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container page">
      <div className="empty-state">
        <span className="big-code">404</span>
        <h3>Page not found</h3>
        <p>The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
        <Link to="/home" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
