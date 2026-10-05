import Icon from './Icon';

const perks = [
  { icon: 'truck', text: 'Free delivery on orders above ₹999' },
  { icon: 'refresh', text: 'Easy 7-day returns' },
  { icon: 'shield', text: 'Secure login with JWT cookies' }
];

function AuthLayout({ image, title, subtitle, children }) {
  return (
    <div className="auth-page">
      <aside className="auth-side" style={{ backgroundImage: `url(${image})` }}>
        <div className="auth-side-overlay">
          <h2>{title}</h2>
          <p>{subtitle}</p>
          <ul className="perk-list">
            {perks.map((perk) => (
              <li key={perk.text}>
                <span className="perk-icon">
                  <Icon name={perk.icon} size={18} />
                </span>
                {perk.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="auth-main">
        <div className="auth-card">{children}</div>
      </section>
    </div>
  );
}

export default AuthLayout;
