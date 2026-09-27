import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ShoppingCart, User, Mail, Phone,
  Calendar, CreditCard, Shield, Clock, CheckCircle,
  XCircle, AlertCircle, Save, Send, MessageSquare,
  Key, FileText, ExternalLink, RefreshCw, Copy
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states for updating status & delivery details
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [deliveryDetails, setDeliveryDetails] = useState('');

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/orders/${id}`);
      const data = res.data.data;
      setOrder(data);
      setOrderStatus(data.orderStatus || 'pending');
      setPaymentStatus(data.paymentStatus || 'pending');
      setAdminNotes(data.adminNotes || '');
      setDeliveryDetails(data.deliveryDetails || '');
    } catch (err) {
      toast.error('Failed to load order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch(`/admin/orders/${id}/status`, {
        orderStatus,
        paymentStatus,
        adminNotes,
        deliveryDetails
      });
      setOrder(res.data.data);
      toast.success('Order status updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (loading) {
    return (
      <div className="order-detail-skeleton">
        <div className="skeleton-bar" style={{ height: 40, width: 250 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 24 }}>
          <div className="skeleton-box" style={{ height: 400 }} />
          <div className="skeleton-box" style={{ height: 400 }} />
        </div>
      </div>
    );
  }

  if (!order) return null;

  const phone = order.customerInfo?.whatsappNumber || order.customerInfo?.phone;
  const waNumber = phone ? phone.replace(/\D/g, '') : '';
  const waPrefilledMsg = encodeURIComponent(
    `Hello ${order.customerInfo?.fullName || 'Customer'}, regarding your STAR BYTE order #${order.orderId || order._id.slice(-8).toUpperCase()}:\n\n` +
    (deliveryDetails ? `Here are your subscription details:\n${deliveryDetails}\n\n` : '') +
    `Thank you for choosing STAR BYTE!`
  );

  return (
    <div className="admin-order-detail-page">
      {/* Top Breadcrumb & Actions */}
      <div className="detail-top-nav">
        <Link to="/admin/orders" className="back-link">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div className="top-nav-actions">
          {phone && (
            <a
              href={`https://wa.me/${waNumber}?text=${waPrefilledMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              <Send size={15} /> WhatsApp Customer
            </a>
          )}
        </div>
      </div>

      {/* Order Title Banner */}
      <div className="order-title-card">
        <div className="title-left">
          <div className="order-id-tag">ORDER #{order.orderId || order._id.slice(-8).toUpperCase()}</div>
          <div className="order-meta-info">
            <span>
              <Calendar size={13} />
              Placed on {new Date(order.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium', timeStyle: 'short'
              })}
            </span>
            <span>•</span>
            <span style={{ textTransform: 'capitalize' }}>
              <CreditCard size={13} /> {order.paymentMethod?.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="title-badges">
          <span className={`badge-status status-${order.orderStatus}`}>
            {order.orderStatus}
          </span>
          <span className={`badge-payment payment-${order.paymentStatus}`}>
            Payment: {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Items, Delivery), Right 1 Col (Update Form, Customer, Timeline) */}
      <div className="detail-grid">
        {/* Left Column */}
        <div className="detail-left-col">
          {/* Order Items */}
          <div className="detail-card">
            <h2 className="card-title">
              <ShoppingCart size={18} /> Order Items ({order.items?.length || 0})
            </h2>

            <div className="items-table-wrapper">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Plan / Duration</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="product-item-cell">
                          {item.productSnapshot?.thumbnail ? (
                            <img
                              src={item.productSnapshot.thumbnail}
                              alt=""
                              className="item-thumb"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="item-thumb-fallback">
                              <ShoppingCart size={16} />
                            </div>
                          )}
                          <div>
                            <div className="product-title">
                              {item.productSnapshot?.name || item.product?.name || 'Product'}
                            </div>
                            <div className="product-cat">
                              {item.productSnapshot?.category || 'Subscription'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="plan-name">{item.plan?.name || 'Standard'}</div>
                        {item.plan?.duration && (
                          <div className="plan-duration">{item.plan.duration}</div>
                        )}
                      </td>
                      <td>${(item.unitPrice || 0).toFixed(2)}</td>
                      <td>x{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        ${(item.totalPrice || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="order-totals-box">
              <div className="total-row">
                <span>Subtotal</span>
                <span>${(order.subtotal || 0).toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="total-row discount">
                  <span>Discount</span>
                  <span>-${(Number(order.discountAmount) || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="total-row grand-total">
                <span>Grand Total</span>
                <span>${(order.total || 0).toFixed(2)} {order.currency || 'USD'}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Credentials Section */}
          <div className="detail-card">
            <div className="card-header-with-action">
              <h2 className="card-title">
                <Key size={18} /> Subscription Credentials & Delivery Details
              </h2>
              {deliveryDetails && (
                <button
                  className="btn btn-glass btn-sm"
                  onClick={() => copyToClipboard(deliveryDetails, 'Credentials')}
                  title="Copy details"
                >
                  <Copy size={13} /> Copy Details
                </button>
              )}
            </div>
            <p className="card-subtitle">
              Enter login credentials, activation codes, or instructions to be shared with the customer.
            </p>

            <textarea
              className="credentials-textarea"
              rows={5}
              placeholder="e.g.&#10;Email: customer@example.com&#10;Password: SecurePassword123!&#10;Activation instructions: Go to..."
              value={deliveryDetails}
              onChange={(e) => setDeliveryDetails(e.target.value)}
            />
          </div>

          {/* Customer Notes */}
          {order.customerNotes && (
            <div className="detail-card">
              <h2 className="card-title">
                <FileText size={18} /> Customer Notes
              </h2>
              <div className="customer-note-box">
                {order.customerNotes}
              </div>
            </div>
          )}

          {/* Status Timeline */}
          <div className="detail-card">
            <h2 className="card-title">
              <Clock size={18} /> Status History & Audit Log
            </h2>
            <div className="timeline-container">
              {order.statusTimeline?.map((entry, index) => (
                <div key={index} className="timeline-step">
                  <div className="timeline-bullet" />
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-status">{entry.status}</span>
                      <span className="timeline-date">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {entry.message && <p className="timeline-msg">{entry.message}</p>}
                    {entry.updatedBy && (
                      <span className="timeline-by">by {entry.updatedBy}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="detail-right-col">
          {/* Order Action / Management Card */}
          <div className="detail-card action-card">
            <h2 className="card-title">Update Order Status</h2>
            <form onSubmit={handleUpdate} className="status-update-form">
              <div className="form-group">
                <label className="form-label">Order Status</label>
                <select
                  className="form-select"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Status</label>
                <select
                  className="form-select"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Admin Internal Note</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Private internal note for this update..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save & Update Order'}</span>
              </button>
            </form>
          </div>

          {/* Customer Details Card */}
          <div className="detail-card">
            <h2 className="card-title">
              <User size={18} /> Customer Details
            </h2>

            <div className="customer-info-list">
              <div className="info-row">
                <span className="info-label">Full Name</span>
                <span className="info-val">{order.customerInfo?.fullName || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email</span>
                <a href={`mailto:${order.customerInfo?.email}`} className="info-val link">
                  {order.customerInfo?.email || 'N/A'}
                </a>
              </div>
              <div className="info-row">
                <span className="info-label">WhatsApp</span>
                {phone ? (
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-val link wa-link"
                  >
                    <Phone size={13} /> {phone}
                  </a>
                ) : (
                  <span className="info-val">Not provided</span>
                )}
              </div>
              {order.customerInfo?.country && (
                <div className="info-row">
                  <span className="info-label">Country</span>
                  <span className="info-val">{order.customerInfo.country}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Proof / Transaction Details */}
          <div className="detail-card">
            <h2 className="card-title">
              <CreditCard size={18} /> Payment Information
            </h2>
            <div className="customer-info-list">
              <div className="info-row">
                <span className="info-label">Method</span>
                <span className="info-val" style={{ textTransform: 'capitalize' }}>
                  {order.paymentMethod?.replace('_', ' ') || 'card'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Status</span>
                <span className="info-val" style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.transactionId && (
                <div className="info-row">
                  <span className="info-label">Txn ID</span>
                  <span className="info-val mono">{order.transactionId}</span>
                </div>
              )}
              {order.proofOfPayment && (
                <div className="info-row-block">
                  <span className="info-label">Payment Proof:</span>
                  <a
                    href={order.proofOfPayment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="proof-img-link"
                  >
                    <img src={order.proofOfPayment} alt="Payment Proof" className="proof-thumb" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-order-detail-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .detail-top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color var(--transition-fast);
        }
        .back-link:hover {
          color: var(--color-primary-light);
        }

        .order-title-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(13, 18, 37, 0.7);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: var(--space-5) var(--space-6);
          backdrop-filter: blur(16px);
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .order-id-tag {
          font-family: monospace;
          font-size: 1.3rem;
          font-weight: 800;
          background: var(--gradient-brand);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.05em;
        }

        .order-meta-info {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-top: 4px;
        }
        .order-meta-info span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .title-badges {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .badge-status {
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: capitalize;
        }
        .badge-status.status-pending { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
        .badge-status.status-processing { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
        .badge-status.status-completed { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
        .badge-status.status-cancelled { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
        .badge-status.status-refunded { background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3); }

        .badge-payment {
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .badge-payment.payment-paid { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
        .badge-payment.payment-pending { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
        .badge-payment.payment-failed { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: var(--space-6);
        }

        @media (max-width: 1024px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }

        .detail-left-col, .detail-right-col {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .detail-card {
          background: rgba(13, 18, 37, 0.6);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          backdrop-filter: blur(12px);
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: var(--space-4);
        }

        .card-header-with-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-subtitle {
          font-size: 0.825rem;
          color: var(--color-text-muted);
          margin-top: -6px;
          margin-bottom: var(--space-4);
        }

        .items-table-wrapper {
          width: 100%;
          overflow-x: auto;
          margin-bottom: var(--space-4);
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .items-table th {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted);
          padding: 10px 12px;
          border-bottom: 1px solid var(--color-border);
        }

        .items-table td {
          padding: 14px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          vertical-align: middle;
          font-size: 0.875rem;
        }

        .product-item-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .item-thumb {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          object-fit: cover;
          border: 1px solid var(--color-border);
        }

        .item-thumb-fallback {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          background: rgba(99, 102, 241, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary-light);
        }

        .product-title {
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .product-cat {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .plan-name {
          font-weight: 600;
          color: var(--color-primary-light);
        }
        .plan-duration {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .order-totals-box {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: var(--space-4);
          background: rgba(7, 11, 24, 0.5);
          border-radius: var(--radius-xl);
          margin-top: var(--space-4);
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
        .total-row.discount {
          color: #10b981;
        }
        .total-row.grand-total {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--color-text-primary);
          border-top: 1px solid var(--color-border);
          padding-top: 10px;
          margin-top: 4px;
        }

        .credentials-textarea {
          width: 100%;
          background: rgba(7, 11, 24, 0.8);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 12px 14px;
          color: var(--color-text-primary);
          font-family: monospace;
          font-size: 0.85rem;
          outline: none;
          line-height: 1.6;
          resize: vertical;
        }
        .credentials-textarea:focus {
          border-color: var(--color-primary);
        }

        .customer-note-box {
          background: rgba(7, 11, 24, 0.5);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 14px;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        .timeline-container {
          position: relative;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .timeline-container::before {
          content: '';
          position: absolute;
          left: 6px;
          top: 6px;
          bottom: 6px;
          width: 2px;
          background: rgba(99, 102, 241, 0.2);
        }

        .timeline-step {
          position: relative;
        }
        .timeline-bullet {
          position: absolute;
          left: -20px;
          top: 4px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--color-primary);
          border: 3px solid #070b18;
        }

        .timeline-content {
          background: rgba(7, 11, 24, 0.4);
          padding: 10px 14px;
          border-radius: var(--radius-lg);
        }
        .timeline-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .timeline-status {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-primary-light);
          text-transform: capitalize;
        }
        .timeline-date {
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }
        .timeline-msg {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          margin-top: 4px;
        }
        .timeline-by {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          font-style: italic;
        }

        .status-update-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-muted);
        }

        .form-select, .form-input {
          background: rgba(7, 11, 24, 0.8);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 10px 14px;
          color: var(--color-text-primary);
          font-size: 0.85rem;
          outline: none;
        }
        .form-select:focus, .form-input:focus {
          border-color: var(--color-primary);
        }

        .customer-info-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .info-label {
          color: var(--color-text-muted);
        }
        .info-val {
          font-weight: 500;
          color: var(--color-text-primary);
        }
        .info-val.link {
          color: var(--color-primary-light);
          text-decoration: none;
        }
        .info-val.link:hover {
          text-decoration: underline;
        }
        .info-val.wa-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #10b981;
        }
        .info-val.mono {
          font-family: monospace;
          font-size: 0.75rem;
        }

        .info-row-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 6px;
        }
        .proof-thumb {
          max-width: 100%;
          max-height: 180px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          object-fit: contain;
        }

        .order-detail-skeleton {
          padding: 24px;
        }
        .skeleton-bar, .skeleton-box {
          border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.04);
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
