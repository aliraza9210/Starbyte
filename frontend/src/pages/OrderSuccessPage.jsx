import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingCart, MessageCircle, Package, ArrowRight, DollarSign, Wallet, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function OrderSuccessPage({ theme, toggleTheme }) {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: 'var(--space-8)',
        paddingTop: 'calc(var(--navbar-height) + 40px)', paddingBottom: 60
      }}>
        <motion.div
          className="success-card"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Animated checkmark */}
          <motion.div
            className="success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 220 }}
          >
            <CheckCircle size={52} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="status-pill-success">
              Order Logged • Awaiting WhatsApp Confirmation
            </div>

            <h1 className="success-title">
              Order Placed Successfully!
            </h1>

            <p className="success-subtitle">
              Your order has been recorded in our system. Please message our official WhatsApp support to complete payment in <strong>Dollars ($ USD) via Binance Pay / USDT</strong> and receive your subscription credentials.
            </p>

            {orderId && (
              <div className="order-id-box">
                <span className="order-id-label">Order Reference ID</span>
                <span className="order-id-value">{orderId}</span>
              </div>
            )}

            <div className="success-info-box">
              <MessageCircle size={24} />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>WhatsApp & Binance Pay Verification:</strong>
                <p style={{ marginTop: 6, fontSize: '0.86rem', lineHeight: 1.6 }}>
                  Our team on WhatsApp will provide you with the official <strong>Binance Pay ID / USDT (BEP20 / TRC20) address</strong>. As soon as payment is confirmed, your subscription login credentials will be delivered within 2–5 minutes!
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a
                href="https://wa.me/923327775418"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
                style={{ justifyContent: 'center', height: 50, fontSize: '1.02rem', fontWeight: 700 }}
              >
                <MessageCircle size={20} /> Open WhatsApp Support (+92 332 7775418)
              </a>

              {orderId && (
                <Link to={`/order/${orderId}`} className="btn btn-glass btn-lg" style={{ justifyContent: 'center' }}>
                  <Package size={18} /> Track Your Order Status
                </Link>
              )}

              <Link to="/products" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>
                Explore More Subscriptions <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />

      <style>{`
        .success-card {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-3xl);
          padding: var(--space-10) var(--space-8);
          max-width: 530px;
          width: 100%;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
        }

        .success-card::before {
          content: '';
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, rgba(37, 211, 102, 0.25) 0%, transparent 70%);
          pointer-events: none;
        }

        .status-pill-success {
          display: inline-flex;
          align-items: center;
          padding: 4px 14px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: rgba(37, 211, 102, 0.15);
          color: #25d366;
          border: 1px solid rgba(37, 211, 102, 0.35);
          margin-bottom: 14px;
        }

        .success-icon {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: rgba(37, 211, 102, 0.12);
          border: 1px solid rgba(37, 211, 102, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-5);
          color: #25d366;
          box-shadow: 0 0 30px rgba(37, 211, 102, 0.25);
        }

        .success-title {
          font-size: 1.85rem;
          font-weight: 800;
          font-family: var(--font-display);
          margin-bottom: var(--space-3);
          color: var(--color-text-primary);
        }

        .success-subtitle {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          line-height: 1.65;
          margin-bottom: var(--space-6);
        }

        .order-id-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: var(--radius-xl);
          padding: 12px 18px;
          margin-bottom: 18px;
        }

        .order-id-label {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted);
        }

        .order-id-value {
          font-size: 0.95rem;
          font-weight: 700;
          font-family: var(--font-display);
          color: var(--color-primary-light);
        }

        .success-info-box {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 18px;
          background: rgba(37, 211, 102, 0.08);
          border: 1px solid rgba(37, 211, 102, 0.3);
          border-radius: var(--radius-xl);
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: var(--space-6);
          text-align: left;
        }

        .success-info-box svg { flex-shrink: 0; color: #25d366; margin-top: 2px; }

        /* Light Mode Overrides */
        [data-theme='light'] .success-card {
          background: #ffffff;
          border: 1px solid rgba(99, 102, 241, 0.18);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.1);
        }

        [data-theme='light'] .success-title {
          color: #0f172a;
        }

        [data-theme='light'] .success-subtitle {
          color: #334155;
        }

        [data-theme='light'] .order-id-box {
          background: #f8faff;
          border-color: rgba(99, 102, 241, 0.18);
        }

        [data-theme='light'] .order-id-value {
          color: #4338ca;
        }

        [data-theme='light'] .success-info-box {
          background: rgba(37, 211, 102, 0.08);
          border-color: rgba(37, 211, 102, 0.25);
          color: #1f2937;
        }
      `}</style>
    </div>
  );
}
