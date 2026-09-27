import { Link } from 'react-router-dom';
import { Twitter, Instagram, Send, Mail, Phone, MapPin, ArrowRight, Star, Shield, Lock } from 'lucide-react';

export default function Footer({ settings = {} }) {
  const year = new Date().getFullYear();

  const categories = [
    { name: 'AI & Productivity', slug: 'ai-productivity' },
    { name: 'Creative & Design', slug: 'creative-design' },
    { name: 'Entertainment', slug: 'entertainment' },
    { name: 'VPN & Security', slug: 'vpn-security' },
    { name: 'Business Tools', slug: 'business-tools' },
    { name: 'Education', slug: 'education' },
  ];

  const quickLinks = [
    { to: '/products', label: 'All Subscriptions' },
    { to: '/cart', label: 'Shopping Cart' },
    { to: '/faq', label: 'FAQ' },
    { to: '/contact', label: 'Contact Us' },
    { to: '/login', label: 'Sign In' },
    { to: '/register', label: 'Create Account' },
    { to: '/admin/login', label: 'Admin Login 🔒' },
  ];

  return (
    <footer className="footer">
      {/* Top border glow */}
      <div className="footer-glow-border" />

      <div className="container">
        {/* Main footer grid */}
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo-row">
              <img src="/logo.png" alt="STAR BYTE" className="footer-logo" />
              <div>
                <div className="footer-brand-name">STAR BYTE</div>
                <div className="footer-tagline">Your Premium Subscription Hub</div>
              </div>
            </div>
            <p className="footer-description">
              Access premium digital subscriptions at unbeatable prices. 
              AI tools, creative software, entertainment, and more — all in one place.
            </p>
            {/* Trust badges */}
            <div className="footer-trust">
              <div className="trust-badge">
                <div className="trust-dot" style={{ background: '#10b981' }} />
                <span>Verified Products</span>
              </div>
              <div className="trust-badge">
                <div className="trust-dot" style={{ background: '#6366f1' }} />
                <span>Secure Payments</span>
              </div>
              <div className="trust-badge">
                <div className="trust-dot" style={{ background: '#06b6d4' }} />
                <span>WhatsApp Support</span>
              </div>
            </div>
            {/* Social links */}
            <div className="footer-socials">
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
              )}
              {settings.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter size={18} />
                </a>
              )}
              {settings.telegramUrl && (
                <a href={settings.telegramUrl} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                  <Send size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h3 className="footer-col-title">Categories</h3>
            <ul className="footer-links">
              {categories.map(cat => (
                <li key={cat.slug}>
                  <Link to={`/products?category=${cat.slug}`} className="footer-link">
                    <ArrowRight size={12} />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h3 className="footer-col-title">Quick Links</h3>
            <ul className="footer-links">
              {quickLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link">
                    <ArrowRight size={12} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h3 className="footer-col-title">Get In Touch</h3>
            <div className="footer-contact">
              <a href={`mailto:${settings.supportEmail || 'astrabytepk@gmail.com'}`} className="footer-contact-item">
                <Mail size={16} />
                <span>{settings.supportEmail || 'astrabytepk@gmail.com'}</span>
              </a>
              <a
                href={`https://wa.me/${(settings.whatsappNumber || '+923327775418').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-item"
              >
                <Phone size={16} />
                <span>{settings.whatsappNumber || '+92 332 7775418'}</span>
              </a>
            </div>

            {/* CTA */}
            <div className="footer-cta">
              <p className="footer-cta-label">Ready to explore?</p>
              <Link to="/products" className="btn btn-primary btn-sm">
                Browse Subscriptions
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            {settings.footerText || `© ${year} STAR BYTE. All rights reserved.`}
          </p>
          <div className="footer-bottom-links">
            <Link to="/faq" className="footer-bottom-link">Privacy Policy</Link>
            <Link to="/faq" className="footer-bottom-link">Terms of Service</Link>
            <Link to="/contact" className="footer-bottom-link">Support</Link>
            <Link to="/admin/login" className="footer-bottom-link footer-admin-link" title="STAR BYTE Admin Login">
              <Shield size={13} /> Admin Portal
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          position: relative;
          background: var(--color-bg-secondary);
          border-top: 1px solid var(--color-border);
          padding: var(--space-16) 0 var(--space-8);
          margin-top: var(--space-24);
        }

        .footer-glow-border {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 1px;
          background: var(--gradient-brand);
          opacity: 0.5;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
          gap: var(--space-12);
          padding-bottom: var(--space-12);
          border-bottom: 1px solid var(--color-border);
        }

        .footer-logo-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }

        .footer-logo {
          height: 48px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.45));
        }

        .footer-brand-name {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.1rem;
          background: var(--gradient-brand);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.05em;
        }

        .footer-tagline {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
          font-weight: 600;
          margin-top: 2px;
        }

        .footer-description {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.7;
          margin-bottom: var(--space-5);
        }

        .footer-trust {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-bottom: var(--space-5);
        }

        .trust-badge {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.825rem;
          color: var(--color-text-secondary);
        }

        .trust-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .footer-socials {
          display: flex;
          gap: var(--space-2);
        }

        .footer-socials a {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-lg);
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          transition: all var(--transition-fast);
        }

        .footer-socials a:hover {
          background: rgba(99, 102, 241, 0.15);
          color: var(--color-primary-light);
          border-color: var(--color-primary);
        }

        .footer-col-title {
          font-size: 0.8125rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-primary);
          margin-bottom: var(--space-5);
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .footer-link {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .footer-link:hover {
          color: var(--color-primary-light);
        }

        .footer-contact {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }

        .footer-contact-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .footer-contact-item:hover {
          color: var(--color-primary-light);
        }

        .footer-cta-label {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin-bottom: var(--space-3);
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-6);
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .footer-copyright {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .footer-bottom-links {
          display: flex;
          gap: var(--space-6);
        }

        .footer-bottom-link {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .footer-bottom-link:hover {
          color: var(--color-primary-light);
        }

        .footer-admin-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--color-primary-light) !important;
          font-weight: 600;
          opacity: 0.85;
          transition: all var(--transition-fast);
        }

        .footer-admin-link:hover {
          opacity: 1;
          color: #ffffff !important;
        }

        [data-theme='light'] .footer-admin-link:hover {
          color: #4338ca !important;
        }

        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: var(--space-8); }
        }

        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr; gap: var(--space-8); }
          .footer-bottom { flex-direction: column; text-align: center; }
          .footer-bottom-links { justify-content: center; }
        }
      `}</style>
    </footer>
  );
}
