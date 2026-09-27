import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageCircle, ShoppingCart, User, Mail,
  Phone, Globe, FileText, ArrowRight, Check,
  ShieldCheck, Sparkles, DollarSign, Wallet
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CheckoutPage({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    whatsapp: user?.whatsapp || '',
    country: user?.country || '',
    orderNotes: ''
  });

  const [errors, setErrors] = useState({});

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data.data || {})).catch(() => {});
    if (items.length === 0) {
      navigate('/cart');
    }
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) errs.email = 'Valid email is required';
    if (!formData.whatsapp.trim()) errs.whatsapp = 'WhatsApp number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleWhatsAppOrder = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const orderRes = await api.post('/orders', {
        items: items.map(item => ({
          productId: item.product._id,
          planId: item.plan?._id,
          quantity: item.quantity
        })),
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          whatsapp: formData.whatsapp,
          country: formData.country
        },
        paymentMethod: 'whatsapp',
        customerNotes: formData.orderNotes
      });

      const order = orderRes.data.data;
      const phone = settings.whatsappNumber?.replace(/\D/g, '') || '923327775418';
      const itemsText = items.map(item =>
        `• ${item.product.name}${item.plan ? ` (${item.plan.name})` : ''} x${item.quantity} — $${item.totalPrice.toFixed(2)}`
      ).join('\n');

      const message = encodeURIComponent(
        `Hello STAR BYTE!\n\n` +
        `*New Order: ${order.orderId}*\n\n` +
        `*Customer Details:*\n` +
        `Name: ${formData.fullName}\n` +
        `Email: ${formData.email}\n` +
        `WhatsApp: ${formData.whatsapp}\n` +
        (formData.country ? `Country: ${formData.country}\n` : '') +
        `\n*Order Items:*\n${itemsText}\n\n` +
        `*Total Amount: $${subtotal.toFixed(2)} USD*\n\n` +
        (formData.orderNotes ? `Notes: ${formData.orderNotes}\n\n` : '') +
        `*Payment Method:*\n` +
        `I would like to pay via Binance Pay (USD / USDT) / WhatsApp.\n\n` +
        `Please send your Binance Pay ID / payment instructions to confirm my order. Thank you!`
      );

      clearCart();
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
      navigate(`/order-success?orderId=${order.orderId}&method=whatsapp`);
    } catch (err) {
      console.error('Order creation error:', err);
      toast.error(err.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div style={{ paddingTop: 'calc(var(--navbar-height) + 50px)', paddingBottom: 80 }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-eyebrow" style={{ marginBottom: 8 }}>
              <ShoppingCart size={14} /> Checkout
            </div>
            <h1 className="section-title" style={{ marginBottom: 36 }}>Complete Your Order</h1>

            <div className="checkout-layout">
              {/* Left: Form */}
              <div className="checkout-form">
                {/* Customer info */}
                <div className="checkout-section">
                  <h2 className="checkout-section-title">
                    <User size={18} /> Customer Information
                  </h2>
                  <div className="checkout-fields">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className={`form-input ${errors.fullName ? 'error' : ''}`}
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={e => setField('fullName', e.target.value)}
                      />
                      {errors.fullName && <span className="form-error">{errors.fullName}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address (For Credential Delivery) *</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                          type="email"
                          className={`form-input ${errors.email ? 'error' : ''}`}
                          style={{ paddingLeft: 42 }}
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={e => setField('email', e.target.value)}
                        />
                      </div>
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">WhatsApp Number *</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                          type="tel"
                          className={`form-input ${errors.whatsapp ? 'error' : ''}`}
                          style={{ paddingLeft: 42 }}
                          placeholder="+92 332 7775418"
                          value={formData.whatsapp}
                          onChange={e => setField('whatsapp', e.target.value)}
                        />
                      </div>
                      {errors.whatsapp && <span className="form-error">{errors.whatsapp}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <div style={{ position: 'relative' }}>
                        <Globe size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                          type="text"
                          className="form-input"
                          style={{ paddingLeft: 42 }}
                          placeholder="Your country"
                          value={formData.country}
                          onChange={e => setField('country', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">
                        <FileText size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                        Order Notes (Optional)
                      </label>
                      <textarea
                        className="form-input"
                        placeholder="Any special instructions, questions, or subscription preferences..."
                        value={formData.orderNotes}
                        onChange={e => setField('orderNotes', e.target.value)}
                        style={{ minHeight: 70 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method: WhatsApp & Binance */}
                <div className="checkout-section">
                  <h2 className="checkout-section-title">
                    <Wallet size={18} /> Payment & Order Method
                  </h2>

                  <div className="whatsapp-payment-card">
                    <div className="whatsapp-card-header">
                      <div className="whatsapp-icon-bubble">
                        <MessageCircle size={28} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="whatsapp-title-row">
                          <h3 className="whatsapp-main-title">Official WhatsApp & Binance Pay Order</h3>
                          <span className="recommended-tag">RECOMMENDED</span>
                        </div>
                        <p className="whatsapp-subtitle">
                          Pay directly in <strong>Dollars ($ USD) via Binance Pay / USDT</strong> or Bank Transfer with 0% fee!
                        </p>
                      </div>
                    </div>

                    <div className="payment-badges-row">
                      <span className="pay-badge binance-badge">
                        <DollarSign size={13} /> Binance Pay (USDT)
                      </span>
                      <span className="pay-badge crypto-badge">
                        <Wallet size={13} /> Crypto Transfer
                      </span>
                      <span className="pay-badge bank-badge">
                        <Check size={13} /> Direct Bank / Raast
                      </span>
                    </div>

                    <div className="steps-guide-box">
                      <div className="guide-step">
                        <div className="step-num">1</div>
                        <div className="step-text">
                          <strong>Place Order:</strong> Click "Confirm & Pay via WhatsApp" below. Your order will be logged in our system.
                        </div>
                      </div>
                      <div className="guide-step">
                        <div className="step-num">2</div>
                        <div className="step-text">
                          <strong>Binance Pay ID / USDT:</strong> WhatsApp (+92 332 7775418) opens with your items & dollar total ($). Our team will send our Binance Pay ID or USDT QR code.
                        </div>
                      </div>
                      <div className="guide-step">
                        <div className="step-num">3</div>
                        <div className="step-text">
                          <strong>Instant Delivery:</strong> Send dollar payment confirmation and receive your premium subscription login credentials within 2–5 minutes!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Order summary */}
              <div className="checkout-summary">
                <h2 className="cart-summary-title">Order Summary</h2>

                {/* Items */}
                <div className="summary-items">
                  {items.map((item) => (
                    <div key={item.key} className="summary-item">
                      <div className="summary-item-info">
                        <div className="summary-item-name">{item.product.name}</div>
                        {item.plan && <div className="summary-item-plan">{item.plan.name}</div>}
                        {(item.plan?.duration || item.product.duration) && (
                          <div className="summary-item-duration">{item.plan?.duration || item.product.duration}</div>
                        )}
                        {item.quantity > 1 && (
                          <div className="summary-item-qty">Qty: {item.quantity}</div>
                        )}
                      </div>
                      <div className="summary-item-price">${item.totalPrice.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="divider" style={{ margin: '14px 0' }} />

                <div className="summary-rows">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)} USD</span>
                  </div>
                  <div className="summary-row">
                    <span>Digital Delivery</span>
                    <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>FREE (Instant)</span>
                  </div>
                  <div className="divider" style={{ margin: '10px 0' }} />
                  <div className="summary-row summary-total">
                    <span>Total Amount</span>
                    <span className="total-gradient-price">${subtotal.toFixed(2)} USD</span>
                  </div>
                </div>

                <button
                  className="btn btn-lg btn-whatsapp"
                  style={{ width: '100%', marginTop: 22, height: 54, fontSize: '1.05rem', fontWeight: 700 }}
                  onClick={handleWhatsAppOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: 18, height: 18 }} />
                      <span>Creating Order...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle size={20} />
                      <span>Pay via WhatsApp / Binance (${subtotal.toFixed(2)})</span>
                    </>
                  )}
                </button>

                <p className="instant-notice">
                  ⚡ Official Support: <strong>+92 332 7775418</strong>
                </p>

                <div className="security-badges-bar">
                  <div className="security-badge-item">
                    <ShieldCheck size={14} />
                    <span>Binance Pay Verified</span>
                  </div>
                  <div className="security-badge-item">
                    <Check size={14} />
                    <span>Instant Delivery</span>
                  </div>
                  <div className="security-badge-item">
                    <Sparkles size={14} />
                    <span>100% Genuine</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer settings={settings} />

      <style>{`
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 390px;
          gap: var(--space-8);
          align-items: start;
        }

        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .checkout-section {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .checkout-section-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: var(--space-5);
          font-family: var(--font-display);
          color: var(--color-text-primary);
        }

        .checkout-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .form-input.error {
          border-color: var(--color-error);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
        }

        /* WhatsApp & Binance Payment Card */
        .whatsapp-payment-card {
          padding: 22px;
          background: linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%);
          border: 1px solid rgba(37, 211, 102, 0.3);
          border-radius: var(--radius-xl);
        }

        .whatsapp-card-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 18px;
        }

        .whatsapp-icon-bubble {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 18px rgba(37, 211, 102, 0.4);
        }

        .whatsapp-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }

        .whatsapp-main-title {
          font-size: 1.05rem;
          font-weight: 800;
          font-family: var(--font-display);
          color: var(--color-text-primary);
        }

        .recommended-tag {
          font-size: 0.68rem;
          font-weight: 800;
          background: rgba(37, 211, 102, 0.2);
          color: #25d366;
          border: 1px solid rgba(37, 211, 102, 0.4);
          padding: 2px 8px;
          border-radius: 999px;
          letter-spacing: 0.06em;
        }

        .whatsapp-subtitle {
          font-size: 0.88rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }

        .payment-badges-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--color-border);
        }

        .pay-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 8px;
        }

        .binance-badge {
          background: rgba(243, 186, 47, 0.15);
          color: #f3ba2f;
          border: 1px solid rgba(243, 186, 47, 0.35);
        }

        .crypto-badge {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .bank-badge {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .steps-guide-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .guide-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }

        .step-num {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(37, 211, 102, 0.18);
          border: 1px solid rgba(37, 211, 102, 0.4);
          color: #25d366;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.78rem;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .checkout-summary {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          position: sticky;
          top: calc(var(--navbar-height) + 20px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin-bottom: var(--space-4);
          max-height: 280px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          gap: var(--space-4);
          align-items: flex-start;
        }

        .summary-item-name {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .summary-item-plan {
          font-size: 0.8rem;
          color: var(--color-primary-light);
          font-weight: 600;
          margin-top: 2px;
        }

        .summary-item-duration, .summary-item-qty {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: 2px;
        }

        .summary-item-price {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--color-text-primary);
          flex-shrink: 0;
        }

        .total-gradient-price {
          font-size: 1.35rem;
          font-weight: 900;
          font-family: var(--font-display);
          background: linear-gradient(135deg, #10b981 0%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .instant-notice {
          text-align: center;
          font-size: 0.78rem;
          color: var(--color-text-muted);
          margin-top: 12px;
        }

        .security-badges-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid var(--color-border);
        }

        .security-badge-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }

        .security-badge-item svg {
          color: var(--color-primary-light);
        }

        /* Light Mode Specific Overrides */
        [data-theme='light'] .checkout-section,
        [data-theme='light'] .checkout-summary {
          background: #ffffff;
          border: 1px solid rgba(99, 102, 241, 0.16);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.08);
        }

        [data-theme='light'] .checkout-section-title {
          color: #0f172a;
        }

        [data-theme='light'] .whatsapp-payment-card {
          background: linear-gradient(135deg, #f0fdf4 0%, #f8faff 100%);
          border: 1px solid rgba(37, 211, 102, 0.35);
        }

        [data-theme='light'] .whatsapp-main-title {
          color: #0f172a;
        }

        [data-theme='light'] .whatsapp-subtitle {
          color: #334155;
        }

        [data-theme='light'] .binance-badge {
          background: #fef9c3;
          color: #854d0e;
          border-color: #fde047;
        }

        [data-theme='light'] .crypto-badge {
          background: #ede9fe;
          color: #5b21b6;
          border-color: #ddd6fe;
        }

        [data-theme='light'] .bank-badge {
          background: #dcfce7;
          color: #166534;
          border-color: #bbf7d0;
        }

        [data-theme='light'] .guide-step {
          color: #334155;
        }

        [data-theme='light'] .step-num {
          background: #dcfce7;
          border-color: #86efac;
          color: #16a34a;
        }

        [data-theme='light'] .summary-item-name {
          color: #0f172a;
        }

        [data-theme='light'] .summary-item-price {
          color: #0f172a;
        }

        [data-theme='light'] .total-gradient-price {
          background: linear-gradient(135deg, #059669 0%, #0284c7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (max-width: 900px) {
          .checkout-layout { grid-template-columns: 1fr; }
          .checkout-summary { position: relative; top: auto; order: -1; }
        }

        @media (max-width: 600px) {
          .checkout-fields { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
