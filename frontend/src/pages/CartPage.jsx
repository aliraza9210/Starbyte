import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, MessageCircle, Package } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useCartStore from '../stores/cartStore';

export default function CartPage({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div style={{ paddingTop: 'calc(var(--navbar-height) + 60px)', paddingBottom: 80 }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
              <div>
                <div className="section-eyebrow"><ShoppingCart size={14} /> Cart</div>
                <h1 className="section-title" style={{ marginBottom: 0 }}>Shopping Cart</h1>
              </div>
              {items.length > 0 && (
                <button className="btn btn-glass btn-sm" onClick={clearCart}>
                  <Trash2 size={14} /> Clear Cart
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="empty-state" style={{ minHeight: 300 }}>
                <div className="empty-state-icon"><ShoppingCart size={28} /></div>
                <div className="empty-state-title">Your cart is empty</div>
                <div className="empty-state-subtitle">Add some premium subscriptions to get started.</div>
                <Link to="/products" className="btn btn-primary">Browse Subscriptions</Link>
              </div>
            ) : (
              <div className="cart-layout">
                {/* Cart items */}
                <div className="cart-items">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.key}
                        className="cart-item"
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Thumbnail */}
                        <div className="cart-item-thumb">
                          {item.product.thumbnail ? (
                            <img src={item.product.thumbnail} alt={item.product.name} />
                          ) : (
                            <div style={{
                              width: '100%', height: '100%',
                              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary-light)',
                              fontFamily: 'Space Grotesk, sans-serif'
                            }}>
                              {item.product.name?.split(' ').slice(0, 2).map(w => w[0]).join('')}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="cart-item-info">
                          <Link to={`/product/${item.product.slug}`} className="cart-item-name">
                            {item.product.name}
                          </Link>
                          {item.plan && (
                            <div className="cart-item-plan">{item.plan.name}</div>
                          )}
                          {(item.plan?.duration || item.product.duration) && (
                            <div className="cart-item-duration">
                              {item.plan?.duration || item.product.duration}
                            </div>
                          )}
                        </div>

                        {/* Quantity */}
                        <div className="cart-item-qty">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            aria-label="Decrease"
                          ><Minus size={14} /></button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            aria-label="Increase"
                          ><Plus size={14} /></button>
                        </div>

                        {/* Price */}
                        <div className="cart-item-price">
                          <div className="price-amount" style={{ fontSize: '1.25rem' }}>
                            ${item.totalPrice.toFixed(2)}
                          </div>
                          {item.quantity > 1 && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                              ${item.unitPrice.toFixed(2)} each
                            </div>
                          )}
                        </div>

                        {/* Remove */}
                        <button
                          className="cart-item-remove"
                          onClick={() => removeItem(item.key)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Order summary */}
                <div className="cart-summary">
                  <h2 className="cart-summary-title">Order Summary</h2>

                  <div className="summary-rows">
                    <div className="summary-row">
                      <span>Subtotal ({items.length} item{items.length > 1 ? 's' : ''})</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Delivery</span>
                      <span style={{ color: 'var(--color-success)' }}>Digital Delivery</span>
                    </div>
                    <div className="divider" style={{ margin: '12px 0' }} />
                    <div className="summary-row summary-total">
                      <span>Total</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginBottom: 12 }}
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout <ArrowRight size={16} />
                  </button>

                  <Link to="/products" className="btn btn-glass" style={{ width: '100%' }}>
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />

      <style>{`
        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: var(--space-8);
          align-items: start;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .cart-item {
          display: grid;
          grid-template-columns: 80px 1fr auto auto auto;
          gap: var(--space-4);
          align-items: center;
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-4) var(--space-5);
          transition: border-color var(--transition-fast);
        }

        .cart-item:hover { border-color: var(--color-border-hover); }

        .cart-item-thumb {
          width: 80px;
          height: 56px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--color-bg-tertiary);
          flex-shrink: 0;
        }

        .cart-item-thumb img { width: 100%; height: 100%; object-fit: cover; }

        .cart-item-name {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--color-text-primary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .cart-item-name:hover { color: var(--color-primary-light); }

        .cart-item-plan {
          font-size: 0.8rem;
          color: var(--color-primary-light);
          font-weight: 600;
          margin-top: 3px;
        }

        .cart-item-duration {
          font-size: 0.78rem;
          color: var(--color-text-muted);
          margin-top: 2px;
        }

        .cart-item-qty {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .cart-item-price {
          text-align: right;
          min-width: 80px;
        }

        .cart-item-remove {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .cart-item-remove:hover {
          color: var(--color-error);
          background: rgba(239,68,68,0.1);
        }

        .cart-summary {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          position: sticky;
          top: calc(var(--navbar-height) + 20px);
        }

        .cart-summary-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: var(--space-5);
          font-family: var(--font-display);
        }

        .summary-rows {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }

        .summary-total {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        @media (max-width: 900px) {
          .cart-layout { grid-template-columns: 1fr; }
          .cart-summary { position: relative; top: auto; }
        }

        @media (max-width: 640px) {
          .cart-item { grid-template-columns: 64px 1fr; grid-template-rows: auto auto; }
          .cart-item-qty { grid-column: 2; }
          .cart-item-price, .cart-item-remove { display: none; }
        }
      `}</style>
    </div>
  );
}
