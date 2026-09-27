import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, User, Sun, Moon, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import api from '../services/api';

export default function Navbar({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const cartStore = useCartStore();
  const { user, logout } = useAuthStore();
  const itemCount = cartStore.items.reduce((a, i) => a + i.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // Search with debounce
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await api.get(`/products/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [searchQuery]);

  const handleSearchSelect = (slug) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/product/${slug}`);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Subscriptions' },
    { to: '/products?category=ai-productivity', label: 'AI Tools' },
    { to: '/faq', label: 'FAQ' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <img src="/logo.png" alt="STAR BYTE" className="navbar-logo" />
          <div className="navbar-brand-text">
            <span className="navbar-brand-name">STAR BYTE</span>
            <span className="navbar-brand-tagline">Premium Hub</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Search */}
          <button
            className="navbar-action-btn"
            onClick={() => setSearchOpen(s => !s)}
            aria-label="Search products"
          >
            <Search size={20} />
          </button>

          {/* Theme toggle */}
          <button
            className="navbar-action-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Cart */}
          <Link to="/cart" className="navbar-action-btn cart-btn" aria-label="Shopping cart">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <motion.span
                className="notif-dot"
                key={itemCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                {itemCount > 99 ? '99+' : itemCount}
              </motion.span>
            )}
          </Link>

          {/* Account */}
          {user ? (
            <div className="account-menu">
              <button
                className="navbar-action-btn account-btn"
                onClick={() => setAccountOpen(s => !s)}
                aria-label="Account menu"
              >
                <div className="account-avatar">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
              </button>
              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    className="account-dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="account-dropdown-header">
                      <p className="account-name">{user.firstName} {user.lastName}</p>
                      <p className="account-email">{user.email}</p>
                    </div>
                    <Link to="/account" className="account-dropdown-item">
                      <User size={15} /> My Account
                    </Link>
                    <Link to="/account?tab=orders" className="account-dropdown-item">
                      <ShoppingCart size={15} /> My Orders
                    </Link>
                    <button
                      className="account-dropdown-item account-logout"
                      onClick={logout}
                    >
                      <LogOut size={15} /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="navbar-signin-prominent">
              <User size={15} />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="navbar-action-btn mobile-menu-btn"
            onClick={() => setMobileOpen(s => !s)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="search-overlay-inner">
              <div className="search-bar" ref={searchRef}>
                <Search size={18} color="var(--color-text-muted)" />
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  aria-label="Search products"
                />
                {searching && <div className="spinner" style={{ width: 16, height: 16 }} />}
                <button onClick={() => setSearchOpen(false)} className="search-close">
                  <X size={18} />
                </button>
              </div>

              {/* Results */}
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(product => (
                    <button
                      key={product._id}
                      className="search-result-item"
                      onClick={() => handleSearchSelect(product.slug)}
                    >
                      <div className="search-result-thumb">
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt={product.name} />
                        ) : (
                          <div className="search-result-thumb-placeholder" />
                        )}
                      </div>
                      <div className="search-result-info">
                        <p className="search-result-name">{product.name}</p>
                        <p className="search-result-category">{product.category?.name}</p>
                      </div>
                      <div className="search-result-price">${product.price}</div>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <div className="search-no-results">No results found for "{searchQuery}"</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={link.to} className="mobile-nav-link">{link.label}</Link>
              </motion.div>
            ))}
            <div className="mobile-menu-footer">
              {!user && (
                <>
                  <Link to="/login" className="btn btn-glass" style={{ width: '100%', marginBottom: 12 }}>
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--navbar-height);
          z-index: var(--z-navbar);
          display: flex;
          align-items: center;
          padding: 0 var(--space-6);
          gap: var(--space-8);
          transition: all 0.4s ease;
        }

        .navbar.scrolled {
          background: rgba(4, 6, 15, 0.88);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border-bottom: 1px solid rgba(99, 102, 241, 0.22);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7);
          height: 64px;
        }

        [data-theme='light'] .navbar.scrolled {
          background: rgba(248, 250, 255, 0.92);
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
        }

        .navbar-signin-prominent {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: var(--radius-lg);
          padding: 8px 18px;
          font-size: 0.875rem;
          font-weight: 700;
          color: #ffffff;
          text-decoration: none;
          box-shadow: 0 4px 18px rgba(99, 102, 241, 0.35);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .navbar-signin-prominent:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(99, 102, 241, 0.55);
          color: #ffffff;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          text-decoration: none;
          flex-shrink: 0;
        }

        .navbar-logo {
          height: 40px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.45));
        }

        .navbar-brand-text {
          display: flex;
          flex-direction: column;
        }

        .navbar-brand-name {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: 0.04em;
          background: var(--gradient-brand);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
        }

        .navbar-brand-tagline {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex: 1;
          justify-content: center;
        }

        .navbar-link {
          padding: 0.5rem 0.875rem;
          border-radius: var(--radius-lg);
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          transition: all var(--transition-fast);
          text-decoration: none;
          position: relative;
        }

        .navbar-link:hover {
          color: var(--color-text-primary);
          background: rgba(99, 102, 241, 0.08);
        }

        .navbar-link.active {
          color: var(--color-primary-light);
          background: rgba(99, 102, 241, 0.1);
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-shrink: 0;
        }

        .navbar-action-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
        }

        .navbar-action-btn:hover {
          background: rgba(99, 102, 241, 0.1);
          color: var(--color-text-primary);
        }

        .cart-btn { position: relative; }

        .account-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--gradient-brand);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          letter-spacing: 0.02em;
        }

        .account-menu {
          position: relative;
        }

        .account-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          min-width: 200px;
          box-shadow: var(--shadow-lg);
          z-index: 100;
        }

        .account-dropdown-header {
          padding: var(--space-4);
          border-bottom: 1px solid var(--color-border);
        }

        .account-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--color-text-primary);
        }

        .account-email {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-top: 2px;
        }

        .account-dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          text-decoration: none;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-sans);
        }

        .account-dropdown-item:hover {
          background: rgba(99, 102, 241, 0.08);
          color: var(--color-text-primary);
        }

        .account-logout {
          color: var(--color-error) !important;
          border-top: 1px solid var(--color-border);
        }

        .mobile-menu-btn {
          display: none;
        }

        /* Search Overlay */
        .search-overlay {
          position: fixed;
          top: var(--navbar-height);
          left: 0;
          right: 0;
          z-index: calc(var(--z-navbar) - 1);
          background: rgba(4, 6, 15, 0.95);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--color-border);
          padding: var(--space-4) var(--space-6);
        }

        .search-overlay-inner {
          max-width: 700px;
          margin: 0 auto;
        }

        .search-close {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 4px;
        }

        .search-results {
          margin-top: var(--space-3);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--color-border);
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: background var(--transition-fast);
          font-family: var(--font-sans);
        }

        .search-result-item:last-child { border-bottom: none; }
        .search-result-item:hover { background: rgba(99, 102, 241, 0.08); }

        .search-result-thumb {
          width: 44px;
          height: 32px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--color-bg-tertiary);
          flex-shrink: 0;
        }

        .search-result-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .search-result-thumb-placeholder {
          width: 100%;
          height: 100%;
          background: var(--gradient-glow);
        }

        .search-result-info { flex: 1; }
        .search-result-name { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }
        .search-result-category { font-size: 0.78rem; color: var(--color-text-muted); }
        .search-result-price { font-size: 0.9rem; font-weight: 700; color: var(--color-primary-light); }

        .search-no-results {
          text-align: center;
          padding: var(--space-4);
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 300px;
          background: var(--color-bg-secondary);
          border-left: 1px solid var(--color-border);
          z-index: calc(var(--z-navbar) + 1);
          padding: calc(var(--navbar-height) + var(--space-8)) var(--space-6) var(--space-8);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .mobile-nav-link {
          display: block;
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          color: var(--color-text-primary);
          text-decoration: none;
          font-size: 1.1rem;
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .mobile-nav-link:hover {
          background: rgba(99, 102, 241, 0.1);
          color: var(--color-primary-light);
        }

        .mobile-menu-footer {
          margin-top: auto;
          padding-top: var(--space-6);
          border-top: 1px solid var(--color-border);
        }

        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: var(--z-navbar);
        }

        @media (max-width: 768px) {
          .navbar-links { display: none; }
          .mobile-menu-btn { display: flex; }
          .navbar { padding: 0 var(--space-4); gap: var(--space-4); }
          .navbar-brand-tagline { display: none; }
        }

        @media (max-width: 480px) {
          .navbar-brand-text { display: none; }
        }

        /* Light mode Navbar overrides */
        [data-theme='light'] .search-overlay {
          background: rgba(248, 250, 255, 0.98);
          border-bottom: 1px solid rgba(99, 102, 241, 0.18);
        }

        [data-theme='light'] .search-results {
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.18);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.12);
        }

        [data-theme='light'] .search-result-name {
          color: #0f172a;
        }

        [data-theme='light'] .search-result-category {
          color: #64748b;
        }

        [data-theme='light'] .search-result-item:hover {
          background: rgba(99, 102, 241, 0.06);
        }

        [data-theme='light'] .account-dropdown {
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.18);
          box-shadow: 0 12px 35px rgba(99, 102, 241, 0.14);
        }

        [data-theme='light'] .account-name {
          color: #0f172a;
        }

        [data-theme='light'] .account-email {
          color: #64748b;
        }

        [data-theme='light'] .account-dropdown-item {
          color: #334155;
        }

        [data-theme='light'] .account-dropdown-item:hover {
          background: rgba(99, 102, 241, 0.08);
          color: #1e1b4b;
        }

        [data-theme='light'] .mobile-menu {
          background: #ffffff;
          border-left-color: rgba(99, 102, 241, 0.18);
        }

        [data-theme='light'] .mobile-nav-link {
          color: #0f172a;
        }
      `}</style>
    </>
  );
}
