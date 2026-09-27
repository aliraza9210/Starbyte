import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Package, Users, DollarSign,
  TrendingUp, Clock, CheckCircle, ArrowRight,
  BarChart3, Star
} from 'lucide-react';
import api from '../../services/api';
import useAdminStore from '../../stores/adminStore';

const StatCard = ({ label, value, icon: Icon, color, change }) => (
  <motion.div
    className="stat-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    whileHover={{ y: -4 }}
  >
    <div className="stat-card-header">
      <div className="stat-icon" style={{ background: `${color}18`, color }}>
        <Icon size={22} />
      </div>
      {change !== undefined && (
        <span className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
          <TrendingUp size={12} />
          {change >= 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </motion.div>
);

export default function AdminDashboard() {
  const { token } = useAdminStore();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, ordersRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/orders?limit=8')
        ]);
        const dashData = dashRes.data.data || {};
        const rawStats = dashData.stats || {};
        const breakdown = {
          pending: rawStats.pendingOrders || 0,
          processing: rawStats.processingOrders || 0,
          completed: rawStats.completedOrders || 0,
          cancelled: rawStats.cancelledOrders || 0,
        };
        setStats({ ...rawStats, statusBreakdown: breakdown });
        setRecentOrders(ordersRes.data.data || []);
        setTopProducts(dashData.topProducts || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
        </div>
        <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Revenue', value: `$${(Number(stats?.totalRevenue) || 0).toFixed(2)}`, icon: DollarSign, color: '#10b981' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: '#6366f1' },
    { label: 'Active Products', value: stats?.activeProducts || 0, icon: Package, color: '#8b5cf6' },
    { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: Users, color: '#06b6d4' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Welcome back. Here's what's happening with your store.</p>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Order status breakdown */}
      {stats?.statusBreakdown && (
        <div className="dashboard-row">
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Order Status Breakdown</h2>
            </div>
            <div className="status-breakdown">
              {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                <div key={status} className="status-breakdown-item">
                  <span className={`badge status-${status}`} style={{ fontSize: '0.72rem' }}>
                    {status.replace('_', ' ')}
                  </span>
                  <span className="status-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Two column: recent orders + top products */}
      <div className="dashboard-grid">
        {/* Recent Orders */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">
              <ShoppingCart size={18} /> Recent Orders
            </h2>
            <Link to="/admin/orders" className="admin-section-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="admin-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order._id}>
                      <td>
                        <Link to={`/admin/orders/${order._id}`} className="table-link">
                          {order.orderId || order._id?.slice(-8)}
                        </Link>
                      </td>
                      <td>
                        <div className="table-customer">{order.customerInfo?.fullName || 'Customer'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{order.customerInfo?.email || '—'}</div>
                      </td>
                      <td style={{ fontWeight: 700 }}>${(Number(order.total) || 0).toFixed(2)}</td>
                      <td>
                        <span className={`badge status-${order.orderStatus || 'pending'}`} style={{ fontSize: '0.7rem' }}>
                          {(order.orderStatus || 'pending').replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" style={{ minHeight: 120 }}>
              <div className="empty-state-title" style={{ fontSize: '0.9rem' }}>No orders yet</div>
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">
              <Star size={18} /> Top Products
            </h2>
            <Link to="/admin/products" className="admin-section-link">
              Manage <ArrowRight size={14} />
            </Link>
          </div>

          <div className="top-products-list">
            {topProducts.length > 0 ? topProducts.map((product, i) => (
              <Link key={product._id} to={`/admin/products/edit/${product._id}`} className="top-product-item">
                <div className="top-product-rank">#{i + 1}</div>
                <div className="top-product-info">
                  <div className="top-product-name">{product.name || 'Subscription'}</div>
                  <div className="top-product-meta">
                    {product.orders || 0} orders sold
                  </div>
                </div>
                <div className="top-product-price">
                  ${(Number(product.revenue || product.price || 0)).toFixed(2)}
                </div>
              </Link>
            )) : (
              <div className="empty-state" style={{ minHeight: 120 }}>
                <div className="empty-state-title" style={{ fontSize: '0.9rem' }}>No products yet</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .admin-page-header { margin-bottom: var(--space-6); }
        .admin-page-title { font-size: 1.5rem; font-weight: 800; font-family: var(--font-display); margin-bottom: 4px; }
        .admin-page-subtitle { font-size: 0.9rem; color: var(--color-text-muted); }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .stat-card {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          cursor: default;
          transition: all var(--transition-base);
        }

        .stat-card:hover { border-color: var(--color-border-hover); box-shadow: var(--shadow-glow); }

        .stat-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-3);
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 100px;
        }

        .stat-change.positive { background: rgba(16,185,129,0.1); color: #10b981; }
        .stat-change.negative { background: rgba(239,68,68,0.1); color: #ef4444; }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          font-family: var(--font-display);
          color: var(--color-text-primary);
          margin-bottom: 4px;
          line-height: 1;
        }

        .stat-label { font-size: 0.825rem; color: var(--color-text-muted); font-weight: 500; }

        .dashboard-row { margin-bottom: var(--space-5); }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: var(--space-5);
        }

        .admin-section {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          overflow: hidden;
        }

        .admin-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-5) var(--space-6);
          border-bottom: 1px solid var(--color-border);
        }

        .admin-section-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.9375rem;
          font-weight: 700;
          font-family: var(--font-sans);
        }

        .admin-section-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: var(--color-primary-light);
          text-decoration: none;
          font-weight: 600;
          transition: gap var(--transition-fast);
        }

        .admin-section-link:hover { gap: 8px; }

        .admin-table-container { overflow-x: auto; }

        .table-link {
          color: var(--color-primary-light);
          text-decoration: none;
          font-size: 0.825rem;
          font-weight: 600;
          font-family: monospace;
        }

        .table-customer { font-size: 0.875rem; font-weight: 600; }

        .status-breakdown {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          padding: var(--space-5) var(--space-6);
        }

        .status-breakdown-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .status-count {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .top-products-list {
          display: flex;
          flex-direction: column;
        }

        .top-product-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-6);
          border-bottom: 1px solid rgba(99,102,241,0.05);
          text-decoration: none;
          transition: background var(--transition-fast);
        }

        .top-product-item:last-child { border-bottom: none; }
        .top-product-item:hover { background: rgba(99,102,241,0.04); }

        .top-product-rank {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--color-primary-light);
          width: 24px;
          flex-shrink: 0;
          opacity: 0.7;
        }

        .top-product-info { flex: 1; min-width: 0; }

        .top-product-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .top-product-meta { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }
        .top-product-price { font-size: 0.875rem; font-weight: 700; color: var(--color-text-primary); flex-shrink: 0; }

        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
