import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShoppingCart, Star, Clock, Zap, ArrowRight, Sparkles } from 'lucide-react';
import useCartStore from '../stores/cartStore';
import toast from 'react-hot-toast';

// Fallback placeholder if svg thumbnail is not present
const ProductPlaceholder = ({ category, name }) => {
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

  const [c1, c2] = colors[category] || ['#6366f1', '#8b5cf6'];
  const initials = name?.split(' ').slice(0, 2).map(w => w[0]).join('') || 'SB';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: `linear-gradient(135deg, ${c1}18 0%, ${c2}18 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        width: 60,
        height: 60,
        borderRadius: 16,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        fontWeight: 800,
        color: '#ffffff',
        fontFamily: 'Space Grotesk, Inter, sans-serif',
        boxShadow: `0 0 30px ${c1}70`
      }}>
        {initials}
      </div>
    </div>
  );
};

export default function ProductCard({ product, variant = 'default' }) {
  const addItem = useCartStore(s => s.addItem);
  const cardRef = useRef(null);

  // 2.5D Spring Tilt Physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 24 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 24 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const defaultPlan = product.plans?.find(p => p.isDefault) || product.plans?.[0];
  const displayPrice = (product.plans?.length > 1 && defaultPlan?.price)
    ? defaultPlan.price
    : (product.price ?? defaultPlan?.price ?? 0);

  const discount = product.originalPrice && product.originalPrice > displayPrice
    ? Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)
    : 0;

  const isBestValue = discount >= 40 || (defaultPlan?.duration && defaultPlan.duration.includes('12'));
  const isPopular = product.isFeatured || product.badge === 'Popular';

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        ref={cardRef}
        className="premium-3d-card"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', display: 'block', color: 'inherit' }}>
          {/* Card Top / Visual Banner */}
          <div className="card-thumb-container">
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.name}
                loading="lazy"
                className="card-thumb-img"
              />
            ) : (
              <ProductPlaceholder category={product.category?.name} name={product.name} />
            )}

            {/* Glowing Accent Gradient Overlay */}
            <div className="card-thumb-gradient" />

            {/* Top Badges */}
            <div className="card-badge-row">
              {isPopular && (
                <span className="badge-pill badge-pill-popular">
                  <Sparkles size={11} />
                  <span>Popular</span>
                </span>
              )}
              {isBestValue && (
                <span className="badge-pill badge-pill-best">
                  <Star size={11} />
                  <span>Best Value</span>
                </span>
              )}
              {discount > 0 && (
                <span className="badge-pill badge-pill-discount">
                  -{discount}% OFF
                </span>
              )}
            </div>

            {/* Instant Delivery Status Pill */}
            <div className="card-status-pill">
              <span className="status-dot-pulse" />
              <span>Instant Delivery</span>
            </div>
          </div>

          {/* Card Information Body */}
          <div className="card-body-content">
            {/* Category and Duration Row */}
            <div className="card-meta-header">
              <span className="card-category-label">
                {product.category?.name || 'Subscription'}
              </span>
              {(defaultPlan?.duration || product.duration) && (
                <span className="card-duration-badge">
                  <Clock size={12} />
                  <span>{defaultPlan?.duration || product.duration}</span>
                </span>
              )}
            </div>

            {/* Product Title */}
            <h3 className="card-product-title">{product.name}</h3>

            {/* Short Description */}
            <p className="card-product-desc">
              {product.shortDescription || 'Verified genuine subscription with full features and instant activation.'}
            </p>

            {/* Price Row */}
            <div className="card-pricing-block">
              <div className="price-main-display">
                <span className="price-currency-sign">$</span>
                <span className="price-amount-bold">
                  {Number(displayPrice).toFixed(2)}
                </span>
              </div>
              {product.originalPrice && product.originalPrice > displayPrice && (
                <div className="price-strikethrough">
                  ${Number(product.originalPrice).toFixed(2)}
                </div>
              )}
              {discount > 0 && (
                <span className="price-save-text">
                  Save ${(Number(product.originalPrice) - displayPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="card-footer-actions">
          <button
            className="btn-card-cart"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={15} />
            <span>Add to Cart</span>
          </button>
          <Link
            to={`/product/${product.slug}`}
            className="btn-card-details"
            aria-label={`View details for ${product.name}`}
          >
            <span>Details</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <style>{`
          .premium-3d-card {
            position: relative;
            background: rgba(13, 18, 37, 0.72);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(99, 102, 241, 0.16);
            border-radius: var(--radius-2xl);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
          }

          .premium-3d-card:hover {
            border-color: rgba(99, 102, 241, 0.45);
            box-shadow: 0 20px 45px -15px rgba(0, 0, 0, 0.8), 0 0 35px -5px rgba(99, 102, 241, 0.3);
          }

          .card-thumb-container {
            position: relative;
            height: 175px;
            overflow: hidden;
            background: #080c1a;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .card-thumb-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .premium-3d-card:hover .card-thumb-img {
            transform: scale(1.06);
          }

          .card-thumb-gradient {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(4, 6, 15, 0.1) 0%, rgba(13, 18, 37, 0.95) 100%);
            pointer-events: none;
          }

          .card-badge-row {
            position: absolute;
            top: 10px;
            left: 10px;
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            z-index: 2;
          }

          .badge-pill {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 9px;
            border-radius: 999px;
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.03em;
            text-transform: uppercase;
            backdrop-filter: blur(12px);
          }

          .badge-pill-popular {
            background: rgba(139, 92, 246, 0.25);
            border: 1px solid rgba(139, 92, 246, 0.5);
            color: #c084fc;
          }

          .badge-pill-best {
            background: rgba(245, 158, 11, 0.25);
            border: 1px solid rgba(245, 158, 11, 0.5);
            color: #fbbf24;
          }

          .badge-pill-discount {
            background: rgba(16, 185, 129, 0.25);
            border: 1px solid rgba(16, 185, 129, 0.5);
            color: #34d399;
          }

          .card-status-pill {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 3px 9px;
            border-radius: 999px;
            font-size: 0.68rem;
            font-weight: 600;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(16, 185, 129, 0.35);
            color: #34d399;
            z-index: 2;
          }

          .status-dot-pulse {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 8px #10b981;
          }

          .card-body-content {
            padding: 16px 20px 14px;
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .card-meta-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            gap: 8px;
          }

          .card-category-label {
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--color-primary-light);
          }

          .card-duration-badge {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 0.75rem;
            color: var(--color-text-muted);
            background: rgba(255, 255, 255, 0.05);
            padding: 2px 7px;
            border-radius: 6px;
          }

          .card-product-title {
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--color-text-primary);
            font-family: var(--font-display);
            margin-bottom: 6px;
            line-height: 1.3;
          }

          .card-product-desc {
            font-size: 0.8125rem;
            color: var(--color-text-secondary);
            line-height: 1.5;
            margin-bottom: 16px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            flex: 1;
          }

          .card-pricing-block {
            display: flex;
            align-items: baseline;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: auto;
          }

          .price-main-display {
            display: flex;
            align-items: baseline;
            color: #ffffff;
            font-family: var(--font-display);
          }

          .price-currency-sign {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--color-primary-light);
            margin-right: 2px;
          }

          .price-amount-bold {
            font-size: 1.45rem;
            font-weight: 800;
            letter-spacing: -0.02em;
          }

          .price-strikethrough {
            font-size: 0.85rem;
            color: var(--color-text-muted);
            text-decoration: line-through;
          }

          .price-save-text {
            font-size: 0.72rem;
            font-weight: 600;
            color: #10b981;
            margin-left: auto;
          }

          .card-footer-actions {
            padding: 0 20px 20px;
            display: flex;
            gap: 10px;
          }

          .btn-card-cart {
            flex: 1.4;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: var(--radius-lg);
            color: #ffffff;
            font-size: 0.825rem;
            font-weight: 600;
            padding: 9px 12px;
            cursor: pointer;
            transition: all 0.25s ease;
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
          }

          .btn-card-cart:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 22px rgba(99, 102, 241, 0.5);
          }

          .btn-card-details {
            flex: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-lg);
            color: var(--color-text-secondary);
            font-size: 0.825rem;
            font-weight: 600;
            padding: 9px 10px;
            text-decoration: none;
            transition: all 0.25s ease;
          }

          .btn-card-details:hover {
            background: rgba(99, 102, 241, 0.12);
            color: #ffffff;
            border-color: rgba(99, 102, 241, 0.35);
          }

          /* Light Mode Specific Overrides */
          [data-theme='light'] .premium-3d-card {
            background: #ffffff;
            border: 1px solid rgba(99, 102, 241, 0.16);
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.08);
          }

          [data-theme='light'] .premium-3d-card:hover {
            border-color: rgba(99, 102, 241, 0.45);
            box-shadow: 0 20px 45px -10px rgba(99, 102, 241, 0.22);
          }

          [data-theme='light'] .card-thumb-container {
            background: #f1f5f9;
          }

          [data-theme='light'] .card-thumb-gradient {
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%);
          }

          [data-theme='light'] .card-product-title {
            color: #0f172a;
          }

          [data-theme='light'] .card-product-desc {
            color: #475569;
          }

          [data-theme='light'] .price-main-display {
            color: #0f172a;
          }

          [data-theme='light'] .price-currency-sign {
            color: #4f46e5;
          }

          [data-theme='light'] .card-duration-badge {
            background: rgba(99, 102, 241, 0.08);
            color: #475569;
          }

          [data-theme='light'] .card-status-pill {
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(16, 185, 129, 0.4);
            color: #059669;
          }

          [data-theme='light'] .btn-card-details {
            background: rgba(99, 102, 241, 0.06);
            border: 1px solid rgba(99, 102, 241, 0.18);
            color: #334155;
          }

          [data-theme='light'] .btn-card-details:hover {
            background: rgba(99, 102, 241, 0.14);
            color: #4338ca;
            border-color: rgba(99, 102, 241, 0.4);
          }
        `}</style>
      </motion.div>
    </div>
  );
}
