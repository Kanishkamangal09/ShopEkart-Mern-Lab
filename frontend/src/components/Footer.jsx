import Logo from './Logo';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p className="footer-text">Fresh finds for everyday life. A MERN stack mini project.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li>Electronics</li>
            <li>Fashion</li>
            <li>Books</li>
            <li>Home</li>
          </ul>
        </div>
        <div>
          <h4>Support</h4>
          <ul>
            <li>hello@shopkart.com</li>
            <li>+91 98765 43210</li>
            <li>Mon – Sat, 10am – 7pm</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} ShopKart. Built with React, Express &amp; MongoDB.</span>
      </div>
    </footer>
  );
}

export default Footer;
