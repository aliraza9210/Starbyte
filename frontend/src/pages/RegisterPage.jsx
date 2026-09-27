import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function RegisterPage({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', whatsapp: ''
  });
  const [errors, setErrors] = useState({});

  const setField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) errs.email = 'Valid email is required';
    if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register(formData);
    if (result.success) {
      toast.success('Account created! Welcome to STAR BYTE.');
      navigate('/account');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="auth-page">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
      </div>

      <div className="auth-container" style={{ maxWidth: 500, paddingBottom: 80 }}>
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-logo">
            <img src="/logo.png" alt="STAR BYTE" />
          </div>

          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join STAR BYTE — Your Premium Subscription Hub</p>

          <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={e => setField('firstName', e.target.value)}
                />
              </div>
              {errors.firstName && <span className="form-error">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className={`form-input ${errors.lastName ? 'error' : ''}`}
                placeholder="Last name"
                value={formData.lastName}
                onChange={e => setField('lastName', e.target.value)}
              />
              {errors.lastName && <span className="form-error">{errors.lastName}</span>}
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Email Address *</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={e => setField('email', e.target.value)}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">WhatsApp Number</label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 234 567 8900"
                  value={formData.whatsapp}
                  onChange={e => setField('whatsapp', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Password *</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={e => setField('password', e.target.value)}
                  autoComplete="new-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPass(s => !s)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ gridColumn: '1 / -1', width: '100%' }}
              disabled={loading}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16 }} /> Creating Account...</>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-switch-link">
              Sign In <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </p>
        </motion.div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          background: var(--color-bg);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .auth-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
        }
        .auth-bg-orb-1 {
          width: 400px; height: 400px;
          background: rgba(99, 102, 241, 0.12);
          top: 10%; left: 10%;
        }
        .auth-bg-orb-2 {
          width: 300px; height: 300px;
          background: rgba(139, 92, 246, 0.1);
          bottom: 20%; right: 15%;
        }
        .auth-container {
          width: 100%;
          max-width: 440px;
          padding: var(--space-6);
          padding-top: calc(var(--navbar-height) + var(--space-8));
          position: relative;
          z-index: 1;
        }
        .auth-card {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-3xl);
          padding: var(--space-10);
          text-align: center;
        }
        .auth-logo { margin: 0 auto var(--space-6); }
        .auth-logo img { height: 64px; width: auto; object-fit: contain; }
        .auth-title {
          font-size: 1.75rem;
          font-weight: 800;
          font-family: var(--font-display);
          margin-bottom: var(--space-2);
        }
        .auth-subtitle { font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: var(--space-8); }
        .auth-form { text-align: left; margin-bottom: var(--space-5); }
        .input-with-icon { position: relative; }
        .input-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted); pointer-events: none;
        }
        .input-with-icon .form-input { padding-left: 42px; }
        .input-icon-right {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: var(--color-text-muted); cursor: pointer; padding: 4px;
          display: flex;
        }
        .auth-switch { margin-top: var(--space-6); font-size: 0.875rem; color: var(--color-text-muted); }
        .auth-switch-link {
          color: var(--color-primary-light); font-weight: 600;
          text-decoration: none; transition: color var(--transition-fast);
        }
        .auth-switch-link:hover { color: var(--color-primary); }
        .form-input.error {
          border-color: var(--color-error);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
        }
      `}</style>
    </div>
  );
}
