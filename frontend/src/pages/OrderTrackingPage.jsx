import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, Star, XCircle, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'payment_received', label: 'Payment Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'delivered', label: 'Delivered', icon: Truck },
  { key: 'completed', label: 'Completed', icon: Star },
];

const STATUS_ORDER = ['pending', 'payment_received', 'processing', 'delivered', 'completed'];

function getStatusIndex(status) {
  return STATUS_ORDER.indexOf(status);
}

export default function OrderTrackingPage({ theme, toggleTheme }) {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Order not found.' : 'Failed to load order.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const isCancelled = order?.orderStatus === 'cancelled' || order?.orderStatus === 'refunded';
  const currentStep = getStatusIndex(order?.orderStatus);

  if (loading) {
    return (
      <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <div style={{ paddingTop: 'calc(var(--navbar-height) + 80px)', paddingBottom: 80 }}>
          <div className="container" style={{ maxWidth: 700 }}>
            <div className="glass-card skeleton" style={{ height: 400 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div className="empty-state">
            <div className="empty-state-icon"><Package size={28} /></div>
            <div className="empty-state-title">{error}</div>
            <Link to="/" className="btn btn-primary">Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div style={{ paddingTop: 'calc(var(--navbar-height) + 60px)', paddingBottom: 80 }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <Link to="/account?tab=orders" className="back-link">
            <ArrowLeft size={16} /> Back to Orders
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="order-track-header">
              <div>
                <div className="section-eyebrow"><Package size={14} /> Order Tracking</div>
                <h1 className="section-title" style={{ marginBottom: 4 }}>{order.orderId}</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <span className={`badge status-${order.orderStatus}`} style={{ fontSize: '0.8rem' }}>
                  {order.orderStatus.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Status timeline */}
            {!isCancelled ? (
              <div className="glass-card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-5)' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-8)', fontFamily: 'var(--font-sans)' }}>
                  Order Status
                </h2>
                <div className="status-timeline">
                  {STATUS_STEPS.map((step, i) => {
                    const isCompleted = i <= currentStep;
                    const isCurrent = i === currentStep;
                    return (
                      <div key={step.key} className="timeline-step">
                        <div className="timeline-left">
                          <motion.div
                            className={`timeline-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                            initial={false}
                            animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <step.icon size={16} />
                          </motion.div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`timeline-line ${isCompleted && i < currentStep ? 'completed' : ''}`} />
                          )}
                        </div>
                        <div className="timeline-content">
                          <div className={`timeline-label ${isCompleted ? 'active' : ''}`}>{step.label}</div>
                          {isCurrent && (
                            <div className="timeline-current-badge">Current Status</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-5)', borderColor: 'rgba(239,68,68,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-error)' }}>
                  <XCircle size={24} />
                  <div>
                    <div style={{ fontWeight: 700 }}>Order {order.orderStatus}</div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                      Contact support if you need assistance.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order items */}
            <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-5)', fontFamily: 'var(--font-sans)' }}>
                Items Ordered
              </h2>
              {order.items.map((item, i) => (
                <div key={i} className="track-item">
                  <div className="track-item-info">
                    <div className="track-item-name">{item.productSnapshot.name}</div>
                    {item.plan?.name && <div className="track-item-plan">{item.plan.name}</div>}
                    {item.plan?.duration && <div className="track-item-duration">{item.plan.duration}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700 }}>${item.totalPrice.toFixed(2)}</div>
                    {item.quantity > 1 && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        x{item.quantity}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer info + Payment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>
                  Customer
                </h3>
                <div className="info-row"><span>Name</span><span>{order.customerInfo.fullName}</span></div>
                <div className="info-row"><span>Email</span><span>{order.customerInfo.email}</span></div>
                {order.customerInfo.whatsapp && (
                  <div className="info-row"><span>WhatsApp</span><span>{order.customerInfo.whatsapp}</span></div>
                )}
              </div>
              <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>
                  Payment
                </h3>
                <div className="info-row">
                  <span>Method</span>
                  <span style={{ textTransform: 'capitalize' }}>{order.paymentMethod}</span>
                </div>
                <div className="info-row">
                  <span>Status</span>
                  <span className={`badge status-${order.paymentStatus}`} style={{ fontSize: '0.75rem' }}>
                    {order.paymentStatus}
                  </span>
                </div>
                {order.transactionId && (
                  <div className="info-row"><span>Transaction</span><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{order.transactionId.slice(0, 20)}...</span></div>
                )}
              </div>
            </div>

            {/* Delivery details if available */}
            {order.deliveryDetails && (
              <div className="glass-card" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-4)', borderColor: 'rgba(16,185,129,0.3)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-success)', fontFamily: 'var(--font-sans)' }}>
                  Delivery Details
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {order.deliveryDetails}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />

      <style>{`
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--color-text-muted);
          text-decoration: none;
          font-size: 0.875rem;
          margin-bottom: var(--space-6);
          transition: color var(--transition-fast);
        }

        .back-link:hover { color: var(--color-primary-light); }

        .order-track-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .status-timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .timeline-step {
          display: flex;
          gap: var(--space-4);
        }

        .timeline-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 36px;
          flex-shrink: 0;
        }

        .timeline-dot {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid var(--color-border);
          background: var(--color-bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          flex-shrink: 0;
          transition: all var(--transition-base);
        }

        .timeline-dot.completed {
          border-color: var(--color-primary);
          background: rgba(99,102,241,0.15);
          color: var(--color-primary-light);
        }

        .timeline-dot.current {
          border-color: var(--color-primary);
          background: var(--gradient-brand);
          color: white;
          box-shadow: 0 0 20px rgba(99,102,241,0.4);
        }

        .timeline-line {
          width: 2px;
          flex: 1;
          min-height: 32px;
          background: var(--color-border);
          margin: 4px 0;
          transition: background var(--transition-slow);
        }

        .timeline-line.completed {
          background: var(--gradient-brand);
        }

        .timeline-content {
          padding: 6px 0 32px;
          flex: 1;
        }

        .timeline-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-muted);
          transition: color var(--transition-base);
        }

        .timeline-label.active { color: var(--color-text-primary); }

        .timeline-current-badge {
          display: inline-block;
          margin-top: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--color-primary-light);
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 100px;
          padding: 2px 8px;
        }

        .track-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-4);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--color-border);
          margin-bottom: var(--space-4);
        }

        .track-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .track-item-name { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }
        .track-item-plan { font-size: 0.78rem; color: var(--color-primary-light); font-weight: 600; margin-top: 2px; }
        .track-item-duration { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          padding: var(--space-2) 0;
          border-bottom: 1px solid rgba(99,102,241,0.05);
        }

        .info-row:last-child { border-bottom: none; }
        .info-row span:first-child { color: var(--color-text-muted); }
        .info-row span:last-child { color: var(--color-text-primary); font-weight: 600; }

        @media (max-width: 640px) {
          .order-track-header > div:last-child { align-self: flex-start; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
