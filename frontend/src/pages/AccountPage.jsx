import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Settings, LogOut, Edit2, Check, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuthStore from '../stores/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AccountPage({ theme, toggleTheme }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout, updateProfile } = useAuthStore();
  const activeTab = searchParams.get('tab') || 'profile';
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', whatsapp: user?.whatsapp || '' });

  useEffect(() => {
    if (activeTab === 'orders') {
      setOrdersLoading(true);
      api.get('/orders/my').then(res => {
        setOrders(res.data.data || []);
      }).catch(() => setOrders([])).finally(() => setOrdersLoading(false));
    }
  }, [activeTab]);

  const handleSaveProfile = async () => {
    const result = await updateProfile(editData);
    if (result.success) {
      toast.success('Profile updated successfully');
      setEditing(false);
    } else {
      toast.error(result.message);
    }
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'orders', label: 'My Orders', icon: Package },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div style={{ paddingTop: 'calc(var(--navbar-height) + 60px)', paddingBottom: 80 }}>
        <div className="container">
          <div className="section-eyebrow" style={{ marginBottom: 8 }}><User size={14} /> Account</div>
          <h1 className="section-title" style={{ marginBottom: 40 }}>
            Hello, {user?.firstName}
          </h1>

          <div className="account-layout">
            {/* Sidebar */}
            <aside className="account-sidebar">
              <div className="account-avatar-large">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="account-user-name">{user?.firstName} {user?.lastName}</div>
              <div className="account-user-email">{user?.email}</div>

              <div className="account-tabs">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    className={`account-tab ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setSearchParams({ tab: tab.key })}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
                <button className="account-tab account-logout-btn" onClick={() => { logout(); window.location.href = '/'; }}>
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </aside>

            {/* Content */}
            <div className="account-content">
              {/* Profile tab */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="account-panel"
                >
                  <div className="account-panel-header">
                    <h2 className="account-panel-title">Profile Information</h2>
                    {!editing ? (
                      <button className="btn btn-glass btn-sm" onClick={() => setEditing(true)}>
                        <Edit2 size={14} /> Edit
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary btn-sm" onClick={handleSaveProfile}>
                          <Check size={14} /> Save
                        </button>
                        <button className="btn btn-glass btn-sm" onClick={() => setEditing(false)}>
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="profile-fields">
                    {[
                      { label: 'First Name', key: 'firstName', value: user?.firstName },
                      { label: 'Last Name', key: 'lastName', value: user?.lastName },
                      { label: 'WhatsApp', key: 'whatsapp', value: user?.whatsapp },
                    ].map(field => (
                      <div key={field.key} className="profile-field">
                        <label className="form-label">{field.label}</label>
                        {editing ? (
                          <input
                            type="text"
                            className="form-input"
                            value={editData[field.key] || ''}
                            onChange={e => setEditData(p => ({ ...p, [field.key]: e.target.value }))}
                          />
                        ) : (
                          <div className="profile-value">{field.value || 'Not set'}</div>
                        )}
                      </div>
                    ))}
                    <div className="profile-field">
                      <label className="form-label">Email Address</label>
                      <div className="profile-value">{user?.email}</div>
                    </div>
                    <div className="profile-field">
                      <label className="form-label">Account Created</label>
                      <div className="profile-value">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Orders tab */}
              {activeTab === 'orders' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="account-panel"
                >
                  <div className="account-panel-header">
                    <h2 className="account-panel-title">My Orders</h2>
                  </div>

                  {ordersLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />
                      ))}
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="orders-list">
                      {orders.map(order => (
                        <Link key={order._id} to={`/order/${order.orderId}`} className="order-row">
                          <div>
                            <div className="order-row-id">{order.orderId}</div>
                            <div className="order-row-date">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                          <div className="order-row-items">
                            {order.items.map(item => item.productSnapshot.name).join(', ')}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span className={`badge status-${order.orderStatus}`} style={{ fontSize: '0.72rem' }}>
                              {order.orderStatus.replace('_', ' ')}
                            </span>
                            <span className="order-row-total">${order.total.toFixed(2)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon"><Package size={24} /></div>
                      <div className="empty-state-title">No orders yet</div>
                      <div className="empty-state-subtitle">Your orders will appear here after you make a purchase.</div>
                      <Link to="/products" className="btn btn-primary">Browse Subscriptions</Link>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Settings tab */}
              {activeTab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="account-panel"
                >
                  <div className="account-panel-header">
                    <h2 className="account-panel-title">Account Settings</h2>
                  </div>
                  <div className="settings-section">
                    <h3 className="settings-section-title">Danger Zone</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>
                      Once you sign out, you'll need to enter your credentials to access your account again.
                    </p>
                    <button
                      className="btn btn-outline"
                      style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                      onClick={() => { logout(); window.location.href = '/'; }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        .account-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: var(--space-8);
          align-items: start;
        }

        .account-sidebar {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          position: sticky;
          top: calc(var(--navbar-height) + 20px);
          text-align: center;
        }

        .account-avatar-large {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--gradient-brand);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          font-weight: 800;
          color: white;
          margin: 0 auto var(--space-4);
          font-family: var(--font-display);
        }

        .account-user-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 4px;
        }

        .account-user-email {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-bottom: var(--space-6);
          word-break: break-all;
        }

        .account-tabs {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          text-align: left;
        }

        .account-tab {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-sans);
          text-align: left;
        }

        .account-tab:hover { background: rgba(99,102,241,0.08); color: var(--color-text-primary); }
        .account-tab.active { background: rgba(99,102,241,0.12); color: var(--color-primary-light); font-weight: 600; }
        .account-logout-btn { color: var(--color-error) !important; margin-top: var(--space-4); border-top: 1px solid var(--color-border); padding-top: var(--space-4); }

        .account-panel {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
        }

        .account-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-6);
        }

        .account-panel-title {
          font-size: 1.1rem;
          font-weight: 700;
          font-family: var(--font-display);
        }

        .profile-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-5);
        }

        .profile-field { display: flex; flex-direction: column; gap: var(--space-2); }

        .profile-value {
          font-size: 0.9375rem;
          color: var(--color-text-primary);
          padding: 0.875rem 1.125rem;
          background: rgba(99,102,241,0.04);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .orders-list { display: flex; flex-direction: column; gap: var(--space-3); }

        .order-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-5);
          background: rgba(99,102,241,0.04);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          text-decoration: none;
          transition: all var(--transition-fast);
          flex-wrap: wrap;
        }

        .order-row:hover { border-color: var(--color-primary); }
        .order-row-id { font-size: 0.875rem; font-weight: 700; color: var(--color-primary-light); }
        .order-row-date { font-size: 0.78rem; color: var(--color-text-muted); margin-top: 2px; }
        .order-row-items { font-size: 0.875rem; color: var(--color-text-secondary); flex: 1; min-width: 100px; }
        .order-row-total { font-weight: 700; color: var(--color-text-primary); }

        .settings-section {
          padding: var(--space-6);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: var(--radius-xl);
          background: rgba(239,68,68,0.03);
        }

        .settings-section-title {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-error);
          margin-bottom: var(--space-3);
          font-family: var(--font-sans);
        }

        @media (max-width: 900px) {
          .account-layout { grid-template-columns: 1fr; }
          .account-sidebar { position: relative; top: auto; }
          .account-tabs { flex-direction: row; flex-wrap: wrap; }
          .account-logout-btn { border-top: none; margin-top: 0; padding-top: 0; }
        }

        @media (max-width: 600px) {
          .profile-fields { grid-template-columns: 1fr; }
          .order-row { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
