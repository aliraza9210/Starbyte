import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Search, Filter, Eye, RefreshCw,
  Clock, CheckCircle, XCircle, AlertCircle, Phone,
  ChevronLeft, ChevronRight, ExternalLink, Calendar,
  CreditCard, DollarSign, ArrowUpRight
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ORDER_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const PAYMENT_STATUSES = [
  { value: '', label: 'All Payments' },
  { value: 'pending', label: 'Payment Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const PAYMENT_METHODS = [
  { value: '', label: 'All Methods' },
  { value: 'stripe', label: 'Credit Card / Stripe' },
  { value: 'crypto', label: 'Crypto (USDT/BTC)' },
  { value: 'binance', label: 'Binance Pay' },
  { value: 'easypaisa', label: 'Easypaisa' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'whatsapp', label: 'WhatsApp / Manual' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (orderStatus) params.set('orderStatus', orderStatus);
      if (paymentStatus) params.set('paymentStatus', paymentStatus);
      if (paymentMethod) params.set('paymentMethod', paymentMethod);

      const res = await api.get(`/admin/orders?${params}`);
      setOrders(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setPages(res.data.pagination?.pages || 1);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, orderStatus, paymentStatus, paymentMethod]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleQuickStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { orderStatus: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      toast.success(`Order ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24', icon: Clock },
      processing: { bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.3)', color: '#818cf8', icon: RefreshCw },
      completed: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', color: '#34d399', icon: CheckCircle },
      cancelled: { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', color: '#f87171', icon: XCircle },
      refunded: { bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)', color: '#94a3b8', icon: AlertCircle },
    };
    const c = map[status] || map.pending;
    const Icon = c.icon;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
        background: c.bg, border: `1px solid ${c.border}`, color: c.color, textTransform: 'capitalize'
      }}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const isPaid = status === 'paid';
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
        background: isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
        color: isPaid ? '#34d399' : '#f87171',
        border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
        textTransform: 'uppercase', letterSpacing: '0.04em'
      }}>
        {status}
      </span>
    );
  };

  return (
    <div className="admin-orders-page">
      {/* Top Header */}
      <div className="orders-header">
        <div>
          <h1 className="admin-page-title">Orders Management</h1>
          <p className="admin-page-subtitle">{total} total orders placed across all channels</p>
        </div>
        <button className="btn btn-glass btn-sm" onClick={fetchOrders} title="Refresh list">
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="orders-toolbar">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by Order ID, customer, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="filters-group">
          <select
            className="filter-select"
            value={orderStatus}
            onChange={(e) => { setOrderStatus(e.target.value); setPage(1); }}
          >
            {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select
            className="filter-select"
            value={paymentStatus}
            onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
          >
            {PAYMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select
            className="filter-select"
            value={paymentMethod}
            onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
          >
            {PAYMENT_METHODS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="admin-card">
        {loading ? (
          <div className="table-loading-skeleton">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-row" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={48} className="empty-icon" />
            <h3>No orders found</h3>
            <p>Try adjusting your search criteria or filter options.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const phone = order.customerInfo?.whatsappNumber || order.customerInfo?.phone;
                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Order ID */}
                      <td>
                        <Link to={`/admin/orders/${order._id}`} className="order-id-link">
                          #{order.orderId || order._id.slice(-8).toUpperCase()}
                        </Link>
                      </td>

                      {/* Customer Info */}
                      <td>
                        <div className="customer-cell">
                          <div className="customer-name">{order.customerInfo?.fullName || 'Guest'}</div>
                          <div className="customer-meta">{order.customerInfo?.email}</div>
                          {phone && (
                            <a
                              href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="customer-whatsapp-link"
                              title="Chat on WhatsApp"
                            >
                              <Phone size={11} /> {phone}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Items */}
                      <td>
                        <div className="order-items-cell">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="item-chip">
                              <span className="item-name">{item.productSnapshot?.name || item.product?.name || 'Product'}</span>
                              {item.plan?.name && <span className="item-plan">({item.plan.name})</span>}
                              <span className="item-qty">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total */}
                      <td>
                        <div className="order-total-price">
                          ${(Number(order.total) || 0).toFixed(2)}
                        </div>
                        <div className="order-currency">{order.currency || 'USD'}</div>
                      </td>

                      {/* Payment */}
                      <td>
                        <div className="payment-cell">
                          <div className="payment-method-tag">
                            {order.paymentMethod?.replace('_', ' ') || 'card'}
                          </div>
                          {getPaymentBadge(order.paymentStatus || 'pending')}
                        </div>
                      </td>

                      {/* Order Status */}
                      <td>
                        <div className="status-cell">
                          {getStatusBadge(order.orderStatus)}
                          <select
                            className="quick-status-dropdown"
                            value={order.orderStatus}
                            disabled={updatingId === order._id}
                            onChange={(e) => handleQuickStatusChange(order._id, e.target.value)}
                            title="Quick Change Status"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </div>
                      </td>

                      {/* Date */}
                      <td>
                        <div className="order-date">
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </div>
                        <div className="order-time">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="action-btn"
                            title="View Full Order Details"
                          >
                            <Eye size={16} />
                            <span>Details</span>
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="admin-pagination">
            <span className="pagination-info">
              Page {page} of {pages} ({total} orders)
            </span>
            <div className="pagination-buttons">
              <button
                className="btn btn-glass btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                className="btn btn-glass btn-sm"
                disabled={page >= pages}
                onClick={() => setPage(p => Math.min(pages, p + 1))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-orders-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .orders-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .orders-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-4);
          background: rgba(13, 18, 37, 0.6);
          backdrop-filter: blur(12px);
          padding: var(--space-4);
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-border);
        }

        .search-form {
          position: relative;
          flex: 1;
          min-width: 260px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
        }

        .search-input {
          width: 100%;
          background: rgba(7, 11, 24, 0.7);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 10px 14px 10px 38px;
          color: var(--color-text-primary);
          font-size: 0.875rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }
        .search-input:focus {
          border-color: var(--color-primary);
        }

        .filters-group {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .filter-select {
          background: rgba(7, 11, 24, 0.7);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 9px 14px;
          color: var(--color-text-secondary);
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }
        .filter-select:focus {
          border-color: var(--color-primary);
        }

        .admin-card {
          background: rgba(13, 18, 37, 0.6);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          backdrop-filter: blur(12px);
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th {
          background: rgba(7, 11, 24, 0.5);
          padding: 14px 18px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted);
          border-bottom: 1px solid var(--color-border);
        }

        .admin-table td {
          padding: 16px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          vertical-align: middle;
        }

        .admin-table tbody tr:hover {
          background: rgba(99, 102, 241, 0.03);
        }

        .order-id-link {
          font-family: monospace;
          font-weight: 700;
          color: var(--color-primary-light);
          text-decoration: none;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          transition: color var(--transition-fast);
        }
        .order-id-link:hover {
          color: #a5b4fc;
          text-decoration: underline;
        }

        .customer-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .customer-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--color-text-primary);
        }
        .customer-meta {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
        .customer-whatsapp-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #10b981;
          text-decoration: none;
          margin-top: 2px;
        }
        .customer-whatsapp-link:hover {
          text-decoration: underline;
        }

        .order-items-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 240px;
        }
        .item-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--color-text-secondary);
        }
        .item-name {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .item-plan {
          color: var(--color-primary-light);
          font-size: 0.72rem;
        }
        .item-qty {
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .order-total-price {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .order-currency {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
        }

        .payment-cell {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-start;
        }
        .payment-method-tag {
          font-size: 0.72rem;
          text-transform: capitalize;
          color: var(--color-text-muted);
        }

        .status-cell {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-start;
        }

        .quick-status-dropdown {
          background: rgba(7, 11, 24, 0.8);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          color: var(--color-text-muted);
          font-size: 0.7rem;
          padding: 2px 6px;
          cursor: pointer;
          outline: none;
        }
        .quick-status-dropdown:focus {
          border-color: var(--color-primary);
          color: var(--color-text-primary);
        }

        .order-date {
          font-size: 0.825rem;
          color: var(--color-text-primary);
        }
        .order-time {
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }

        .table-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-lg);
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: var(--color-primary-light);
          font-size: 0.8rem;
          font-weight: 500;
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .action-btn:hover {
          background: rgba(99, 102, 241, 0.2);
          color: #fff;
          border-color: var(--color-primary);
        }

        .admin-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-top: 1px solid var(--color-border);
          background: rgba(7, 11, 24, 0.4);
        }

        .pagination-info {
          font-size: 0.825rem;
          color: var(--color-text-muted);
        }

        .pagination-buttons {
          display: flex;
          gap: 8px;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: var(--color-text-muted);
        }
        .empty-icon {
          margin-bottom: 16px;
          opacity: 0.4;
        }
        .empty-state h3 {
          font-size: 1.1rem;
          color: var(--color-text-primary);
          margin-bottom: 6px;
        }

        .table-loading-skeleton {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .skeleton-row {
          height: 48px;
          border-radius: var(--radius-lg);
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite;
        }
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
