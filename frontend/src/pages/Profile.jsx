import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';
import { apiRequest } from '../services/api';
import PasswordInput from '../components/PasswordInput';
import Icon from '../components/Icon';

const emptyForm = { oldPassword: '', newPassword: '', confirmPassword: '' };

function Profile() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (form.newPassword.length < 6) {
      setStatus({ type: 'error', message: 'New password must be at least 6 characters' });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    setSaving(true);
    try {
      const data = await apiRequest('/customers/change-password', {
        method: 'PATCH',
        body: { oldPassword: form.oldPassword, newPassword: form.newPassword }
      });
      setStatus({ type: 'success', message: data.message || 'Password changed successfully' });
      setForm(emptyForm);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="container page">
      <div className="page-head">
        <h1>My account</h1>
      </div>

      <div className="profile-layout">
        <aside className="card profile-card">
          <span className="avatar avatar-lg">{user.fullName.charAt(0).toUpperCase()}</span>
          <h2>{user.fullName}</h2>
          <p className="muted">{user.email}</p>

          <dl className="detail-list">
            <div>
              <dt>Phone</dt>
              <dd>{user.phone}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>{memberSince}</dd>
            </div>
            <div>
              <dt>Items in cart</dt>
              <dd>{cartCount}</dd>
            </div>
          </dl>

          <button type="button" className="btn btn-outline btn-block" onClick={handleLogout}>
            <Icon name="logout" size={18} /> Logout
          </button>
        </aside>

        <section className="card">
          <h2 className="card-title">Change password</h2>
          <p className="muted card-subtitle">Use at least 6 characters. You&apos;ll stay logged in.</p>

          {status.message && (
            <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {status.message}
            </div>
          )}

          <form className="form form-narrow" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="oldPassword">Current password</label>
              <PasswordInput
                id="oldPassword"
                name="oldPassword"
                autoComplete="current-password"
                value={form.oldPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="newPassword">New password</label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                autoComplete="new-password"
                value={form.newPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">Confirm new password</label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Profile;
