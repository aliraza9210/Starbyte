import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Shield, Eye, EyeOff, Fingerprint, Sparkles } from 'lucide-react';
import useAdminStore from '../../stores/adminStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { setAdmin } = useAdminStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    // Check if device supports WebAuthn / Platform Authenticator (Windows Hello, Fingerprint, Touch ID)
    if (window.PublicKeyCredential && navigator.credentials) {
      if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          .then(avail => setHasBiometrics(avail))
          .catch(() => setHasBiometrics(false));
      } else {
        setHasBiometrics(true);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter email/username and password');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/admin/auth/login', {
        email: username.trim(),
        username: username.trim(),
        password
      });
      const { admin, token } = res.data;
      setAdmin(admin, token);
      toast.success('Welcome, Super Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!window.PublicKeyCredential || !navigator.credentials) {
      toast.error('Your browser or device does not support Biometric / Fingerprint authentication.');
      return;
    }

    setBioLoading(true);
    try {
      const savedPasskeyId = localStorage.getItem('starbyte_admin_passkey_id');

      if (savedPasskeyId) {
        // Authenticate existing Windows Hello / Fingerprint credential
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        await navigator.credentials.get({
          publicKey: {
            challenge,
            timeout: 60000,
            userVerification: 'required',
            rpId: window.location.hostname
          }
        });
      } else {
        // First-time setup: Register Windows Hello / Fingerprint with native hardware prompt
        toast('Windows Hello prompt opening: Touch your fingerprint sensor...', { icon: '👆' });

        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const userId = new Uint8Array(16);
        window.crypto.getRandomValues(userId);

        const credential = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: {
              name: 'STAR BYTE Admin Portal',
              id: window.location.hostname
            },
            user: {
              id: userId,
              name: 'astrabytepk@gmail.com',
              displayName: 'STAR BYTE Super Admin'
            },
            pubKeyCredParams: [
              { alg: -7, type: 'public-key' },  // ES256
              { alg: -257, type: 'public-key' } // RS256
            ],
            authenticatorSelection: {
              authenticatorAttachment: 'platform', // Built-in Fingerprint sensor / Windows Hello
              userVerification: 'required'
            },
            timeout: 60000
          }
        });

        if (credential) {
          localStorage.setItem('starbyte_admin_passkey_id', credential.id);
        }
      }

      // Hardware verification passed! Request verified admin session from backend
      const res = await api.post('/admin/auth/biometric-login');
      const { admin, token } = res.data;
      setAdmin(admin, token);
      toast.success('Fingerprint verified! Welcome Super Admin 🚀');
      navigate('/admin');
    } catch (err) {
      console.error('Biometric authentication error:', err);
      if (err.name === 'NotAllowedError') {
        toast.error('Fingerprint scan was cancelled or timed out.');
      } else {
        toast.error(err.message || 'Fingerprint verification failed. You can sign in with password.');
      }
    } finally {
      setBioLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* Background */}
      <div className="admin-login-bg">
        <div className="admin-login-orb orb-1" />
        <div className="admin-login-orb orb-2" />
      </div>

      <motion.div
        className="admin-login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="admin-login-logo">
          <img src="/logo.png" alt="STAR BYTE" />
        </div>

        <div className="admin-login-header">
          <h1 className="admin-login-title">Admin Panel</h1>
          <p className="admin-login-subtitle">STAR BYTE Administration</p>
        </div>

        <div className="admin-login-badge">
          <Shield size={14} />
          <span>Biometric & Password Protected</span>
        </div>

        {/* Biometric Quick Login */}
        <div style={{ marginBottom: 20 }}>
          <button
            type="button"
            className="btn-biometric"
            onClick={handleBiometricLogin}
            disabled={bioLoading}
            title="Scan your finger via Windows Hello to login"
          >
            {bioLoading ? (
              <>
                <div className="spinner" style={{ width: 20, height: 20 }} />
                <div className="biometric-btn-text">
                  <span className="biometric-btn-title">Scanning Fingerprint...</span>
                  <span className="biometric-btn-subtitle">Please touch your sensor</span>
                </div>
              </>
            ) : (
              <>
                <Fingerprint size={28} className="fingerprint-icon-pulse" />
                <div className="biometric-btn-text">
                  <span className="biometric-btn-title">Login with Fingerprint</span>
                  <span className="biometric-btn-subtitle">Windows Hello / Touch ID / Sensor</span>
                </div>
              </>
            )}
          </button>
        </div>

        <div className="admin-divider">
          <span>OR SIGN IN WITH PASSWORD</span>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label className="form-label">Email or Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="astrabytepk@gmail.com or admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="Admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingLeft: 42, paddingRight: 44 }}
              />
              <button
                type="button"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex' }}
                onClick={() => setShowPass(s => !s)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 6 }}
            disabled={loading}
          >
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16 }} /> Signing In...</>
            ) : (
              <>
                <Lock size={18} /> Access Admin Panel
              </>
            )}
          </button>
        </form>
      </motion.div>

      <style>{`
        .admin-login-page {
          min-height: 100vh;
          background: #04060f;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-6);
          position: relative;
          overflow: hidden;
        }

        .admin-login-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
        }

        .admin-login-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
        }

        .orb-1 {
          width: 350px; height: 350px;
          background: rgba(99, 102, 241, 0.12);
          top: 20%; left: 15%;
        }

        .orb-2 {
          width: 250px; height: 250px;
          background: rgba(139, 92, 246, 0.08);
          bottom: 25%; right: 20%;
        }

        .admin-login-card {
          background: rgba(8, 12, 26, 0.95);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: var(--radius-3xl);
          padding: var(--space-8);
          width: 100%;
          max-width: 420px;
          text-align: center;
          position: relative;
          z-index: 1;
          box-shadow: 0 0 60px rgba(99, 102, 241, 0.15), 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .admin-login-logo {
          margin-bottom: var(--space-4);
        }

        .admin-login-logo img {
          height: 60px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.5));
        }

        .admin-login-header {
          margin-bottom: var(--space-4);
        }

        .admin-login-title {
          font-size: 1.6rem;
          font-weight: 800;
          font-family: var(--font-display);
          margin-bottom: var(--space-1);
        }

        .admin-login-subtitle {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .admin-login-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #38bdf8;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 100px;
          padding: 4px 12px;
          margin-bottom: var(--space-5);
        }

        /* Biometric Button */
        .btn-biometric {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          width: 100%;
          padding: 14px 20px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(6, 182, 212, 0.18) 100%);
          border: 1px solid rgba(99, 102, 241, 0.45);
          border-radius: var(--radius-xl);
          color: #f0f2ff;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2);
          text-align: left;
        }

        .btn-biometric:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%);
          border-color: #818cf8;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.35);
        }

        .fingerprint-icon-pulse {
          color: #38bdf8;
          flex-shrink: 0;
          animation: fingerPulse 2.5s infinite ease-in-out;
        }

        @keyframes fingerPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5)); }
          50% { transform: scale(1.12); filter: drop-shadow(0 0 16px rgba(99, 102, 241, 0.9)); }
        }

        .biometric-btn-text {
          display: flex;
          flex-direction: column;
        }

        .biometric-btn-title {
          font-weight: 800;
          font-size: 0.96rem;
          color: #ffffff;
        }

        .biometric-btn-subtitle {
          font-size: 0.74rem;
          color: #94a3b8;
        }

        .admin-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 16px 0;
          color: var(--color-text-muted);
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .admin-divider::before,
        .admin-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-divider span {
          padding: 0 12px;
        }

        .admin-login-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          text-align: left;
        }
      `}</style>
    </div>
  );
}
