import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, MessageCircle, Star, Clock, Shield,
  CheckCircle, ChevronDown, ArrowLeft, Zap, Package
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import useCartStore from '../stores/cartStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProductImageDisplay = ({ product }) => {
  const colors = {
    'AI & Productivity': ['#6366f1', '#8b5cf6'],
    'Creative & Design': ['#f59e0b', '#ef4444'],
    'Entertainment': ['#ef4444', '#ec4899'],
    'VPN & Security': ['#10b981', '#06b6d4'],
    'Business Tools': ['#3b82f6', '#6366f1'],
    'Education': ['#06b6d4', '#3b82f6'],
    'Career': ['#f97316', '#ef4444'],
    'Developer Tools': ['#6366f1', '#06b6d4'],
    'Email & Communication': ['#84cc16', '#10b981'],
  };

  const catName = product.category?.name || '';
  const [c1, c2] = colors[catName] || ['#6366f1', '#8b5cf6'];
  const initials = product.name?.split(' ').slice(0, 2).map(w => w[0]).join('') || 'SB';

  return (
    <div className="product-image-container">
      {product.thumbnail ? (
        <img src={product.thumbnail} alt={product.name} className="product-main-image" />
      ) : (
        <div className="product-image-placeholder" style={{
          background: `linear-gradient(135deg, ${c1}18 0%, ${c2}18 100%)`,
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${c1}12 1px, transparent 1px), linear-gradient(90deg, ${c1}12 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }} />
          {/* 3D-ish floating circle */}
          <motion.div
            className="product-placeholder-orb"
            style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 0 60px ${c1}50` }}
            animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            {initials}
          </motion.div>
          {/* Glow rings */}
          {[80, 120, 160].map((size, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: '50%',
                border: `1px solid ${c1}${40 - i * 12}`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
              animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 + i * 0.5, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ProductDetailPage({ theme, toggleTheme }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore(s => s.addItem);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState(null);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const [prodRes, settingsRes] = await Promise.all([
          api.get(`/products/${slug}`),
          api.get('/settings')
        ]);
        const prod = prodRes.data.data;
        setProduct(prod);
        setRelated(prodRes.data.related || []);
        setSettings(settingsRes.data.data || {});

        // Set default plan
        const defaultPlan = prod.plans?.find(p => p.isDefault) || prod.plans?.[0];
        if (defaultPlan) {
          if (prod.plans?.length === 1 && prod.price !== undefined) {
            defaultPlan.price = prod.price;
          }
          setSelectedPlan(defaultPlan);
        }
      } catch (err) {
        if (err.response?.status === 404) setError('Product not found.');
        else setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = () => {
    addItem(product, selectedPlan, quantity);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    addItem(product, selectedPlan, quantity);
    navigate('/checkout');
  };

  const handleWhatsAppOrder = () => {
    const phone = settings.whatsappNumber?.replace(/\D/g, '') || '923327775418';
    const price = selectedPlan?.price ?? product.price;
    const planInfo = selectedPlan ? ` (${selectedPlan.name})` : '';
    const message = encodeURIComponent(
      `Hello STAR BYTE!\n\nI'd like to order:\n\n` +
      `Product: ${product.name}${planInfo}\n` +
      `Price: $${price}\n` +
      `Quantity: ${quantity}\n\n` +
      `Please assist me with this order. Thank you!`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const currentPrice = (product?.plans?.length > 1 && selectedPlan?.price)
    ? selectedPlan.price
    : (product?.price ?? selectedPlan?.price ?? 0);
  const originalPrice = selectedPlan?.originalPrice ?? product?.originalPrice;
  const discount = originalPrice && originalPrice > currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  if (loading) {
    return (
      <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <div style={{ paddingTop: 'calc(var(--navbar-height) + 60px)', paddingBottom: 60 }}>
          <div className="container">
            <div className="product-detail-layout">
              <div className="glass-card skeleton" style={{ height: 420 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: i === 0 ? 40 : 20, borderRadius: 8 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div className="empty-state">
            <div className="empty-state-icon"><Package size={28} /></div>
            <div className="empty-state-title">{error || 'Product not found'}</div>
            <Link to="/products" className="btn btn-primary">Browse All Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div style={{ paddingTop: 'calc(var(--navbar-height) + 40px)' }}>
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span>/</span>
            <Link to="/products" className="breadcrumb-link">Subscriptions</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link to={`/products?category=${product.category.slug}`} className="breadcrumb-link">
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span style={{ color: 'var(--color-text-primary)' }}>{product.name}</span>
          </div>

          {/* Main layout */}
          <div className="product-detail-layout">
            {/* Left: Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ProductImageDisplay product={product} />

              {/* Key badges below image */}
              <div className="product-badges">
                {product.stockStatus === 'in_stock' && (
                  <div className="badge badge-success">
                    <CheckCircle size={12} /> In Stock
                  </div>
                )}
                {product.warranty && (
                  <div className="badge badge-info">
                    <Shield size={12} /> {product.warranty}
                  </div>
                )}
                {product.deliveryMethod === 'whatsapp' && (
                  <div className="badge badge-primary">
                    <Zap size={12} /> WhatsApp Delivery
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right: Info */}
            <motion.div
              className="product-info"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Category */}
              {product.category && (
                <Link to={`/products?category=${product.category.slug}`} className="product-category-link">
                  {product.category.name}
                </Link>
              )}

              {/* Name */}
              <h1 className="product-detail-name">{product.name}</h1>

              {/* Short description */}
              {product.shortDescription && (
                <p className="product-detail-short-desc">{product.shortDescription}</p>
              )}

              {/* Price */}
              <div className="product-price-block">
                <div className="price-display">
                  <span className="price-currency">$</span>
                  <span className="price-amount" style={{ fontSize: '2.5rem' }}>
                    {currentPrice.toFixed(2)}
                  </span>
                </div>
                {originalPrice && originalPrice > currentPrice && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="price-original">${originalPrice.toFixed(2)}</span>
                    <span className="price-discount">-{discount}%</span>
                  </div>
                )}
              </div>

              {/* Duration */}
              {(selectedPlan?.duration || product.duration) && (
                <div className="product-duration">
                  <Clock size={16} />
                  <span>{selectedPlan?.duration || product.duration}</span>
                </div>
              )}

              {/* Plans */}
              {product.plans && product.plans.length > 0 && (
                <div className="plan-selector">
                  <label className="form-label">Select Plan</label>
                  <div className="plan-options">
                    {product.plans.map(plan => (
                      <button
                        key={plan._id || plan.name}
                        className={`plan-option ${selectedPlan?._id === plan._id || selectedPlan?.name === plan.name ? 'selected' : ''}`}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <div className="plan-option-name">{plan.name}</div>
                        {plan.duration && (
                          <div className="plan-option-duration">
                            <Clock size={12} /> {plan.duration}
                          </div>
                        )}
                        <div className="plan-option-price">${plan.price.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="quantity-selector">
                <label className="form-label">Quantity</label>
                <div className="quantity-controls">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >-</button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(q => q + 1)}
                    aria-label="Increase quantity"
                  >+</button>
                </div>
              </div>

              {/* Total */}
              <div className="product-total">
                <span>Total</span>
                <span>${(currentPrice * quantity).toFixed(2)}</span>
              </div>

              {/* CTAs */}
              <div className="product-ctas">
                <button className="btn btn-glass" onClick={handleAddToCart}>
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
                <button className="btn btn-primary" onClick={handleBuyNow}>
                  Buy Now
                </button>
                <button className="btn btn-whatsapp" onClick={handleWhatsAppOrder} style={{ width: '100%' }}>
                  <MessageCircle size={18} />
                  Order via WhatsApp
                </button>
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="product-features">
                  <h3 className="product-features-title">What's Included</h3>
                  <ul className="feature-list">
                    {product.features.map((feature, i) => (
                      <li key={i}>
                        <CheckCircle size={16} className="icon" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>

          {/* Tabs: Description, Features, Delivery */}
          <div className="product-tabs-section">
            {product.description && (
              <div className="product-tab-block">
                <h2 className="product-tab-title">About This Product</h2>
                <div className="product-description" dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
              </div>
            )}

            <div className="product-info-grid">
              <div className="info-block">
                <h3 className="info-block-title">
                  <Zap size={16} /> Delivery Information
                </h3>
                <p className="info-block-text">
                  {product.deliveryMethod === 'whatsapp'
                    ? 'This subscription will be delivered via WhatsApp after payment confirmation. Our team typically responds within minutes.'
                    : 'This subscription will be delivered to your email address after payment confirmation.'}
                </p>
              </div>

              {product.warranty && (
                <div className="info-block">
                  <h3 className="info-block-title">
                    <Shield size={16} /> Warranty
                  </h3>
                  <p className="info-block-text">
                    This product includes a {product.warranty}. If your subscription stops working within the warranty period, contact us and we will replace it at no cost.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ */}
            {product.faq && product.faq.length > 0 && (
              <div className="product-tab-block">
                <h2 className="product-tab-title">Frequently Asked Questions</h2>
                <div className="faq-list">
                  {product.faq.map((item, i) => (
                    <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                      <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                        <span>{item.question}</span>
                        <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={18} />
                        </motion.div>
                      </button>
                      <motion.div
                        className="faq-answer"
                        initial={false}
                        animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p>{item.answer}</p>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div style={{ marginBottom: 80 }}>
              <h2 className="section-title" style={{ marginBottom: 32 }}>Related Products</h2>
              <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                {related.map(prod => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer settings={settings} />

      <style>{`
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.825rem;
          color: var(--color-text-muted);
          margin-bottom: var(--space-8);
          flex-wrap: wrap;
        }

        .breadcrumb-link {
          color: var(--color-text-muted);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .breadcrumb-link:hover { color: var(--color-primary-light); }

        .product-detail-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-12);
          margin-bottom: var(--space-12);
          align-items: start;
        }

        .product-image-container {
          position: sticky;
          top: calc(var(--navbar-height) + 20px);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          border: 1px solid rgba(99, 102, 241, 0.25);
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 30px -5px rgba(99, 102, 241, 0.2);
          background: rgba(13, 18, 37, 0.8);
        }

        .product-main-image {
          width: 100%;
          aspect-ratio: 4/3;
          object-fit: cover;
          display: block;
        }

        .product-image-placeholder {
          width: 100%;
          aspect-ratio: 4/3;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .product-placeholder-orb {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: 800;
          color: white;
          font-family: var(--font-display);
          position: relative;
          z-index: 2;
        }

        .product-badges {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          padding: var(--space-4);
        }

        .product-category-link {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-primary-light);
          text-decoration: none;
          margin-bottom: var(--space-3);
        }

        .product-detail-name {
          font-size: clamp(1.5rem, 2.5vw, 2.2rem);
          font-weight: 800;
          font-family: var(--font-display);
          margin-bottom: var(--space-4);
          line-height: 1.2;
        }

        .product-detail-short-desc {
          font-size: 1rem;
          color: var(--color-text-secondary);
          line-height: 1.7;
          margin-bottom: var(--space-5);
        }

        .product-price-block {
          margin-bottom: var(--space-5);
          display: flex;
          align-items: baseline;
          gap: var(--space-4);
          flex-wrap: wrap;
        }

        .product-duration {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          margin-bottom: var(--space-5);
          padding: var(--space-3) var(--space-4);
          background: rgba(99,102,241,0.06);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          width: fit-content;
        }

        .plan-selector {
          margin-bottom: var(--space-5);
        }

        .plan-options {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-top: var(--space-2);
        }

        .plan-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-5);
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-sans);
          text-align: left;
        }

        .plan-option:hover { border-color: var(--color-primary); }
        .plan-option.selected {
          border-color: var(--color-primary);
          background: rgba(99,102,241,0.1);
          box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
        }

        .plan-option-name {
          font-weight: 600;
          color: var(--color-text-primary);
          font-size: 0.9375rem;
        }

        .plan-option-duration {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .plan-option-price {
          font-weight: 800;
          font-family: var(--font-display);
          font-size: 1.1rem;
          background: var(--gradient-brand);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          flex-shrink: 0;
        }

        .quantity-selector {
          margin-bottom: var(--space-4);
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-top: var(--space-2);
        }

        .qty-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-lg);
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
          font-size: 1.1rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-sans);
        }

        .qty-btn:hover { border-color: var(--color-primary); }

        .qty-value {
          font-size: 1.1rem;
          font-weight: 700;
          min-width: 32px;
          text-align: center;
        }

        .product-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-5);
          background: rgba(99,102,241,0.06);
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-border);
          margin-bottom: var(--space-5);
          font-weight: 700;
          font-size: 1rem;
        }

        .product-ctas {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }

        .product-ctas .btn-whatsapp {
          grid-column: 1 / -1;
        }

        .product-features {
          padding: var(--space-5);
          background: rgba(99,102,241,0.04);
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-border);
        }

        .product-features-title {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: var(--space-4);
          color: var(--color-text-secondary);
          font-family: var(--font-sans);
        }

        .product-tabs-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          margin-bottom: var(--space-12);
        }

        .product-tab-block {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
        }

        .product-tab-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: var(--space-5);
          font-family: var(--font-display);
        }

        .product-description {
          font-size: 0.9375rem;
          color: var(--color-text-secondary);
          line-height: 1.8;
        }

        .product-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-5);
        }

        .info-block {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
        }

        .info-block-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.9375rem;
          font-weight: 700;
          margin-bottom: var(--space-3);
          font-family: var(--font-sans);
        }

        .info-block-text {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.7;
        }

        @media (max-width: 900px) {
          .product-detail-layout { grid-template-columns: 1fr; }
          .product-image-container { position: relative; top: auto; }
          .product-info-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .product-ctas { grid-template-columns: 1fr; }
        }

        /* Light mode ProductDetailPage overrides */
        [data-theme='light'] .product-image-container {
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.18);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.08);
        }

        [data-theme='light'] .product-detail-name {
          color: #0f172a;
        }

        [data-theme='light'] .product-detail-short-desc {
          color: #334155;
        }

        [data-theme='light'] .product-duration {
          background: rgba(99, 102, 241, 0.06);
          border-color: rgba(99, 102, 241, 0.16);
          color: #1e1b4b;
        }

        [data-theme='light'] .plan-option {
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.16);
        }

        [data-theme='light'] .plan-option.selected {
          background: rgba(99, 102, 241, 0.08);
          border-color: var(--color-primary);
        }

        [data-theme='light'] .plan-option-name {
          color: #0f172a;
        }

        [data-theme='light'] .plan-option-duration {
          color: #64748b;
        }

        [data-theme='light'] .qty-btn {
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.2);
          color: #0f172a;
        }

        [data-theme='light'] .product-total {
          background: rgba(99, 102, 241, 0.06);
          border-color: rgba(99, 102, 241, 0.16);
          color: #0f172a;
        }

        [data-theme='light'] .product-features {
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.16);
        }

        [data-theme='light'] .product-features-title {
          color: #475569;
        }

        [data-theme='light'] .product-tab-block {
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.16);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.05);
        }

        [data-theme='light'] .product-tab-title {
          color: #0f172a;
        }

        [data-theme='light'] .product-description {
          color: #334155;
        }

        [data-theme='light'] .info-block {
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.16);
        }

        [data-theme='light'] .info-block-title {
          color: #0f172a;
        }

        [data-theme='light'] .info-block-text {
          color: #334155;
        }
      `}</style>
    </div>
  );
}
