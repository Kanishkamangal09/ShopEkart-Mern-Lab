import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';

function validate(form) {
  const errors = {};

  if (!form.fullName.trim()) errors.fullName = 'Full name is required';

  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Enter a valid email';

  if (!form.phone.trim()) errors.phone = 'Phone number is required';
  else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) errors.phone = 'Enter a valid 10-digit mobile number';

  if (!form.password) errors.password = 'Password is required';
  else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';

  return errors;
}

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // clear the field error as soon as the user starts fixing it
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    setSubmitError('');

    try {
      await apiRequest('/customers/register', {
        method: 'POST',
        body: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password
        }
      });

      navigate('/login', {
        replace: true,
        state: { message: 'Registration successful! Please log in.' }
      });
    } catch (err) {
      setSubmitError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  const fieldClass = (name) => `field ${errors[name] ? 'has-error' : ''}`;

  return (
    <AuthLayout
      image="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
      title="Shop smarter, every day."
      subtitle="Create a free account in less than a minute."
    >
      <h1 className="auth-title">Create account</h1>
      <p className="auth-subtitle">Join ShopKart and start shopping</p>

      {submitError && <div className="alert alert-error">{submitError}</div>}

      <form onSubmit={handleSubmit} className="form" noValidate>
        <div className={fieldClass('fullName')}>
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            placeholder="John Doe"
            autoComplete="name"
            value={form.fullName}
            onChange={handleChange}
          />
          {errors.fullName && <span className="field-error">{errors.fullName}</span>}
        </div>

        <div className="form-row">
          <div className={fieldClass('email')}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className={fieldClass('phone')}>
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="9876543210"
              autoComplete="tel"
              maxLength={10}
              value={form.phone}
              onChange={handleChange}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>
        </div>

        <div className={fieldClass('password')}>
          <label htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="At least 6 characters"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
