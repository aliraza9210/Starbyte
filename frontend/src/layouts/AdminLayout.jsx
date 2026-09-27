import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Tag, Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import useAdminStore from '../stores/adminStore';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="admin-root">
      {/* Sidebar */}
      <aside className={`admin-nav ${sidebarOpen ? 'expanded' : 'collapsed'} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="admin-nav-logo">
          <img src="/logo.png" alt="STAR BYTE" />
          {sidebarOpen && (
            <div>
              <div className="admin-brand-name">STAR BYTE</div>
              <div className="admin-brand-role">Admin Panel</div>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="admin-nav-links">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
              onClick={() => setMobileSidebarOpen(false)}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
              {isActive(item) && sidebarOpen && <ChevronRight size={14} className="admin-nav-active-arrow" />}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="admin-nav-footer">
          {sidebarOpen && admin && (
            <div className="admin-user-info">
              <div className="admin-user-avatar">{admin.name?.[0] || 'A'}</div>
              <div>
                <div className="admin-user-name">{admin.name || 'Admin'}</div>
                <div className="admin-user-role">Administrator</div>
              </div>
            </div>
          )}
          <button
            className="admin-logout-btn"
            onClick={handleLogout}
            title="Sign Out"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div className="admin-mobile-overlay" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className={`admin-main-area ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        {/* Admin top bar */}
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Desktop collapse toggle */}
            <button
              className="admin-topbar-btn desktop-only"
              onClick={() => setSidebarOpen(s => !s)}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            {/* Mobile menu */}
            <button
              className="admin-topbar-btn mobile-only"
              onClick={() => setMobileSidebarOpen(s => !s)}
              aria-label="Toggle mobile menu"
            >
              {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Page title */}
            <div className="admin-topbar-title">
              {NAV_ITEMS.find(item => isActive(item))?.label || 'Dashboard'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" className="btn btn-glass btn-sm" target="_blank" rel="noopener">
              View Store
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="admin-page-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .admin-root {
          display: flex;
          min-height: 100vh;
          background: #070b18;
          color: var(--color-text-primary);
          font-family: var(--font-sans);
        }

        .admin-nav {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          background: rgba(7, 11, 24, 0.98);
          border-right: 1px solid var(--color-border);
          z-index: 200;
          display: flex;
          flex-direction: column;
          transition: width 0.3s ease;
          overflow: hidden;
        }

        .admin-nav.expanded { width: 240px; }
        .admin-nav.collapsed { width: 64px; }

        .admin-nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 16px;
          border-bottom: 1px solid var(--color-border);
          min-height: 72px;
          flex-shrink: 0;
        }

        .admin-nav-logo img { height: 36px; width: auto; flex-shrink: 0; }

        .admin-brand-name {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1rem;
          background: var(--gradient-brand);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .admin-brand-role {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--color-text-muted);
          font-weight: 600;
          white-space: nowrap;
        }

        .admin-nav-links {
          flex: 1;
          padding: 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-lg);
          text-decoration: none;
          color: var(--color-text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          transition: all var(--transition-fast);
          white-space: nowrap;
          position: relative;
        }

        .admin-nav-item:hover {
          background: rgba(99,102,241,0.08);
          color: var(--color-text-primary);
        }

        .admin-nav-item.active {
          background: rgba(99,102,241,0.12);
          color: var(--color-primary-light);
          font-weight: 600;
        }

        .admin-nav-active-arrow {
          margin-left: auto;
          color: var(--color-primary-light);
        }

        .admin-nav-footer {
          padding: 16px 8px;
          border-top: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .admin-user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
        }

        .admin-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--gradient-brand);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .admin-user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap;
        }

        .admin-user-role {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }

        .admin-logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-lg);
          background: transparent;
          border: none;
          color: var(--color-error);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background var(--transition-fast);
          font-family: var(--font-sans);
          white-space: nowrap;
          width: 100%;
        }

        .admin-logout-btn:hover { background: rgba(239,68,68,0.08); }

        .admin-main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.3s ease;
          min-width: 0;
        }

        .admin-main-area.sidebar-expanded { margin-left: 240px; }
        .admin-main-area.sidebar-collapsed { margin-left: 64px; }

        .admin-topbar {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 64px;
          background: rgba(7, 11, 24, 0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-6);
        }

        .admin-topbar-btn {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-lg);
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .admin-topbar-btn:hover {
          background: rgba(99,102,241,0.1);
          color: var(--color-text-primary);
        }

        .admin-topbar-title {
          font-weight: 700;
          font-size: 1rem;
          color: var(--color-text-primary);
        }

        .admin-page-content {
          flex: 1;
          padding: var(--space-8);
          overflow-y: auto;
        }

        .admin-mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 199;
        }

        .desktop-only { display: flex; }
        .mobile-only { display: none; }

        @media (max-width: 1024px) {
          .admin-nav {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            width: 240px !important;
          }
          .admin-nav.mobile-open {
            transform: translateX(0);
          }
          .admin-main-area.sidebar-expanded,
          .admin-main-area.sidebar-collapsed {
            margin-left: 0 !important;
          }
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }

        @media (max-width: 640px) {
          .admin-page-content { padding: var(--space-4); }
        }
      `}</style>
    </div>
  );
}
