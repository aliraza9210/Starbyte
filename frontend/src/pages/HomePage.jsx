import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Zap, Shield, CheckCircle, MessageCircle, ArrowRight,
  Star, ChevronDown, Plus, Minus, Brain, Palette, Film, Lock,
  Briefcase, BookOpen, TrendingUp, Code, Mail, Package,
  Sparkles, Award, Headphones, RefreshCw, ShoppingCart, ChevronLeft, ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

const HeroScene = lazy(() => import('../3d/HeroScene'));

// Category icons map
const CATEGORY_ICONS = {
  'ai-productivity': Brain,
  'creative-design': Palette,
  'entertainment': Film,
  'vpn-security': Lock,
  'business-tools': Briefcase,
  'education': BookOpen,
  'career': TrendingUp,
  'developer-tools': Code,
  'email-communication': Mail,
};

const CATEGORY_COLORS = {
  'ai-productivity': '#8b5cf6',
  'creative-design': '#f59e0b',
  'entertainment': '#ef4444',
  'vpn-security': '#10b981',
  'business-tools': '#3b82f6',
  'education': '#06b6d4',
  'career': '#f97316',
  'developer-tools': '#6366f1',
  'email-communication': '#84cc16',
};

// 6 Core Value Propositions
const WHY_STAR_BYTE = [
  {
    icon: Zap,
    title: 'Instant Delivery',
    tag: 'Automated 24/7',
    desc: 'Receive your verified credentials within minutes of checkout via our automated dispatch and WhatsApp channel.',
    color: '#06b6d4'
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    tag: 'Bank-Grade',
    desc: 'Every transaction is encrypted with 256-bit SSL protocol via Stripe and verified international payment pathways.',
    color: '#6366f1'
  },
  {
    icon: Award,
    title: 'Quality Guaranteed',
    tag: '100% Genuine',
    desc: 'Every account and license is individually tested. Enjoy complete warranty coverage with immediate replacement guarantee.',
    color: '#10b981'
  },
  {
    icon: Headphones,
    title: 'Personal Support',
    tag: 'Human Specialists',
    desc: 'Get fast, personalized support anytime on WhatsApp from dedicated engineers who know our tools inside and out.',
    color: '#8b5cf6'
  },
  {
    icon: Package,
    title: 'Wide Selection',
    tag: '24+ Flagships',
    desc: 'Access industry-leading AI models, creative suites, streaming hubs, and enterprise privacy tools in one catalog.',
    color: '#f59e0b'
  },
  {
    icon: RefreshCw,
    title: 'Always Updating',
    tag: 'Continuous',
    desc: 'We continually update our subscriptions to match the newest AI releases, model updates, and software editions.',
    color: '#ec4899'
  },
];

// 4-Step Timeline
const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Choose Your Subscription',
    desc: 'Browse our catalog of 24+ premium AI, developer, design, and entertainment services.',
    icon: Sparkles
  },
  {
    step: '02',
    title: 'Place Your Order',
    desc: 'Checkout smoothly using our encrypted credit card gateway or complete your order via WhatsApp.',
    icon: ShoppingCart
  },
  {
    step: '03',
    title: 'Receive Your Details',
    desc: 'Get instant credentials, activation instructions, and warranty access sent to your email and WhatsApp.',
    icon: KeyRoundIcon
  },
  {
    step: '04',
    title: 'Start Using',
    desc: 'Log in, unlock all premium capabilities immediately, and elevate your productivity and entertainment.',
    icon: Zap
  },
];

function KeyRoundIcon(props) {
  return (
    <svg width={props.size || 22} height={props.size || 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/>
      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>
    </svg>
  );
}

// Verified Reviews with product info
const REVIEWS = [
  {
    name: 'Sarah Mitchell',
    role: 'AI Product Lead',
    product: 'ChatGPT Plus (1 Month)',
    rating: 5,
    avatar: 'SM',
    text: 'Delivered in under 3 minutes via WhatsApp. It has been completely reliable and saved me over 70% compared to official pricing.'
  },
  {
    name: 'James Keller',
    role: 'Creative Director',
    product: 'Canva Pro (12 Months)',
    rating: 5,
    avatar: 'JK',
    text: 'Upgraded our entire branding team with Canva Pro. Seamless activation, team brand kits work flawlessly. Top notch service!'
  },
  {
    name: 'Fatima Al-Mansoor',
    role: 'Senior Software Engineer',
    product: 'Gemini AI Pro (1 Month)',
    rating: 5,
    avatar: 'FA',
    text: 'STAR BYTE is my go-to hub for all AI tooling subscriptions. Gemini 1.5 Pro workspace integration works without any hitch.'
  },
  {
    name: 'Ahmed Raza',
    role: 'Digital Strategist',
    product: 'Netflix 4K UHD (3 Months)',
    rating: 5,
    avatar: 'AR',
    text: 'Netflix 4K streaming was active immediately. Ultra-fast customer support on WhatsApp when I asked about profile setup.'
  },
  {
    name: 'David Chen',
    role: 'Data Scientist',
    product: 'Coursera Plus (12 Months)',
    rating: 5,
    avatar: 'DC',
    text: 'Unlocked all certificates for my master specialization at a fraction of the cost. Genuine subscription with certificate issuance.'
  },
  {
    name: 'Elena Rostova',
    role: 'Motion Designer',
    product: 'NordVPN (12 Months)',
    rating: 5,
    avatar: 'ER',
    text: 'Ultra-fast dedicated IP servers, no disconnects, full privacy. STAR BYTE customer support was prompt and courteous.'
  }
];

// FAQs
const FAQ_ITEMS = [
  {
    question: 'How quickly will I receive my subscription credentials?',
    answer: 'Most subscriptions are delivered within 3 to 10 minutes following order confirmation. Your access credentials and activation guide are sent directly to your registered email and WhatsApp number.'
  },
  {
    question: 'Are STAR BYTE subscriptions genuine and legal?',
    answer: 'Yes, 100%. All subscriptions are procured through verified authorized distributor programs, regional corporate tiers, and volume developer licenses. Every account has full genuine feature access.'
  },
  {
    question: 'What happens if my subscription encounters an issue?',
    answer: 'Every product comes with our STAR BYTE Replacement Warranty covering your chosen plan duration. If any account disruption happens, our 24/7 WhatsApp support team will immediately repair or replace it.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We support all major credit and debit cards (Visa, MasterCard, American Express) through Stripe 256-bit encrypted checkout. We also offer direct WhatsApp orders with flexible regional payment options.'
  },
  {
    question: 'Can I purchase multiple subscriptions in one checkout?',
    answer: 'Yes! You can add multiple subscriptions across different categories into your cart and complete checkout in a single secure transaction.'
  },
  {
    question: 'How does WhatsApp ordering work?',
    answer: 'Click any "Order on WhatsApp" or "WhatsApp Us" button, and you will be connected directly to our verified concierge (+92 332 7775418) who will assist with product selection, payment, and immediate delivery.'
  }
];

// Section reveal animation wrapper
const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 36 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

export default function HomePage({ theme, toggleTheme }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const heroRef = useRef(null);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 450], [1, 0.94]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, catsRes, settingsRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/categories'),
          api.get('/settings')
        ]);
        let prods = productsRes.data.data || [];
        if (prods.length === 0) {
          const fallbackRes = await api.get('/products?limit=16');
          prods = fallbackRes.data.data || [];
        }
        setFeaturedProducts(prods);
        setCategories(catsRes.data.data || []);
        setSettings(settingsRes.data.data || {});
      } catch (err) {
        console.error('Failed to load homepage data:', err);
        try {
          const fallbackRes = await api.get('/products?limit=16');
          setFeaturedProducts(fallbackRes.data.data || []);
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter products by selected chip
  const filteredProducts = activeCategoryFilter === 'all'
    ? featuredProducts
    : featuredProducts.filter(p => {
        const catSlug = p.category?.slug || '';
        return catSlug === activeCategoryFilter;
      });

  // Flagship spotlight product
  const spotlightProduct = featuredProducts.find(p => p.slug === 'chatgpt-plus' || p.slug === 'gemini-ai-pro') || featuredProducts[0];
  const gridProducts = spotlightProduct
    ? filteredProducts.filter(p => p._id !== spotlightProduct._id)
    : filteredProducts;

  const nextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % REVIEWS.length);
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  const whatsappNum = (settings.whatsappNumber || '+923327775418').replace(/\D/g, '');

  return (
    <div className="starbyte-app-wrapper">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      {/* ===================== HERO SECTION ===================== */}
      <motion.section
        ref={heroRef}
        className="hero-section"
        style={{ opacity: heroOpacity }}
      >
        {/* Interactive 3D Canvas Background */}
        <motion.div className="hero-3d-bg" style={{ scale: heroScale }}>
          <Suspense fallback={
            <div className="hero-fallback-bg">
              <div className="hero-fallback-radial" />
            </div>
          }>
            <HeroScene />
          </Suspense>
        </motion.div>

        {/* Ambient Darkened Radial Gradient Overlay */}
        <div className="hero-ambient-vignette" />

        {/* Hero Foreground Content */}
        <div className="hero-content">
          {/* Eyebrow Pill */}
          <motion.div
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="glow-dot-cyan" />
            <span>YOUR PREMIUM SUBSCRIPTION HUB</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="hero-headline"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            Premium Digital Subscriptions.<br />
            <span className="gradient-text-hero">One Universe.</span>
          </motion.h1>

          {/* Supporting Subtitle */}
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            Access top-tier AI models, developer tools, creative software, and streaming platforms 
            at unprecedented rates — with instant automated delivery and full warranty.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            className="hero-buttons-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <Link to="/products" className="btn btn-primary btn-lg hero-cta-btn">
              <span>Explore Subscriptions</span>
              <ArrowRight size={18} />
            </Link>
            <a
              href={`https://wa.me/${whatsappNum}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-lg hero-whatsapp-btn"
            >
              <MessageCircle size={18} />
              <span>WhatsApp Us</span>
            </a>
          </motion.div>

          {/* Quick Metrics Bar */}
          <motion.div
            className="hero-metrics-bar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <div className="metric-item">
              <div className="metric-val">24+</div>
              <div className="metric-lbl">Digital Flagships</div>
            </div>
            <div className="metric-separator" />
            <div className="metric-item">
              <div className="metric-val">3 Min</div>
              <div className="metric-lbl">Avg. Delivery</div>
            </div>
            <div className="metric-separator" />
            <div className="metric-item">
              <div className="metric-val">100%</div>
              <div className="metric-lbl">Replacement Warranty</div>
            </div>
            <div className="metric-separator" />
            <div className="metric-item">
              <div className="metric-val">24/7</div>
              <div className="metric-lbl">WhatsApp Concierge</div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="hero-scroll-cue"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        >
          <ChevronDown size={22} />
        </motion.div>
      </motion.section>

      {/* ===================== TRUST METRICS BAR ===================== */}
      <section className="trust-strip">
        <div className="container">
          <div className="trust-grid-4">
            <div className="trust-cell">
              <div className="trust-cell-icon" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' }}>
                <Zap size={22} />
              </div>
              <div className="trust-cell-info">
                <h4>Instant Activation</h4>
                <p>Delivered to your WhatsApp & email in minutes</p>
              </div>
            </div>
            <div className="trust-cell">
              <div className="trust-cell-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8' }}>
                <Shield size={22} />
              </div>
              <div className="trust-cell-info">
                <h4>Secure Stripe Checkout</h4>
                <p>256-bit bank encryption & verified gateways</p>
              </div>
            </div>
            <div className="trust-cell">
              <div className="trust-cell-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                <CheckCircle size={22} />
              </div>
              <div className="trust-cell-info">
                <h4>Guaranteed Quality</h4>
                <p>100% verified genuine credentials & warranty</p>
              </div>
            </div>
            <div className="trust-cell">
              <div className="trust-cell-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#a78bfa' }}>
                <MessageCircle size={22} />
              </div>
              <div className="trust-cell-info">
                <h4>Direct WhatsApp Care</h4>
                <p>Immediate 1-on-1 human technical support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURED SUBSCRIPTIONS SECTION ===================== */}
      <section className="section featured-section" id="featured">
        <div className="container">
          <Reveal>
            <div className="section-header-row">
              <div>
                <div className="section-eyebrow">
                  <Sparkles size={14} />
                  <span>Curated Marketplace</span>
                </div>
                <h2 className="section-title">Featured Subscriptions</h2>
                <p className="section-subtitle">
                  Power your workflow with industry-standard digital subscriptions at unbeatable prices.
                </p>
              </div>
              <Link to="/products" className="btn btn-glass view-all-btn">
                <span>View Full Catalog</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>

          {/* Interactive Category Filter Chips */}
          <Reveal delay={0.1}>
            <div className="filter-chips-scroll">
              <button
                className={`filter-chip ${activeCategoryFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter('all')}
              >
                All Subscriptions
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  className={`filter-chip ${activeCategoryFilter === cat.slug ? 'active' : ''}`}
                  onClick={() => setActiveCategoryFilter(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Spotlight + Grid Showcase */}
          {loading ? (
            <div className="products-grid-skeleton">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="showcase-container">
              {/* Flagship Spotlight Card (when in 'all' view) */}
              {activeCategoryFilter === 'all' && spotlightProduct && (
                <Reveal delay={0.15}>
                  <div className="spotlight-card">
                    <div className="spotlight-glow" />
                    <div className="spotlight-inner">
                      <div className="spotlight-thumb-wrap">
                        <img
                          src={spotlightProduct.thumbnail || '/products/chatgpt-plus.svg'}
                          alt={spotlightProduct.name}
                          className="spotlight-thumb-img"
                        />
                        <div className="spotlight-badge">FLAGSHIP SUBSCRIPTION</div>
                      </div>
                      <div className="spotlight-details">
                        <div className="spotlight-meta">
                          <span className="spotlight-cat">{spotlightProduct.category?.name || 'AI & Productivity'}</span>
                          <span className="spotlight-delivery"><Zap size={13} /> Instant Automated Delivery</span>
                        </div>
                        <h3 className="spotlight-title">{spotlightProduct.name}</h3>
                        <p className="spotlight-desc">
                          {spotlightProduct.shortDescription || 'Experience full access to frontier intelligence, high-speed compute, and exclusive tools.'}
                        </p>
                        <div className="spotlight-features-list">
                          <div className="spotlight-feature-item">
                            <CheckCircle size={15} color="#10b981" />
                            <span>100% Genuine Official License</span>
                          </div>
                          <div className="spotlight-feature-item">
                            <CheckCircle size={15} color="#10b981" />
                            <span>Full Replacement Warranty Coverage</span>
                          </div>
                          <div className="spotlight-feature-item">
                            <CheckCircle size={15} color="#10b981" />
                            <span>Immediate WhatsApp & Email Activation</span>
                          </div>
                        </div>
                        <div className="spotlight-footer">
                          <div className="spotlight-price">
                            <span className="spotlight-curr">$</span>
                            <span className="spotlight-amount">{spotlightProduct.price?.toFixed(2)}</span>
                            {spotlightProduct.originalPrice > spotlightProduct.price && (
                              <span className="spotlight-orig">${spotlightProduct.originalPrice.toFixed(2)}</span>
                            )}
                          </div>
                          <div className="spotlight-actions">
                            <Link to={`/product/${spotlightProduct.slug}`} className="btn btn-primary btn-md">
                              <span>Get Now</span>
                              <ArrowRight size={16} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )}

              {/* Responsive Cards Grid */}
              <div className="featured-cards-grid">
                {(activeCategoryFilter === 'all' ? gridProducts : filteredProducts).map((product, i) => (
                  <Reveal key={product._id} delay={0.06 * Math.min(i, 6)}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===================== WHY STAR BYTE ===================== */}
      <section className="section why-section">
        <div className="container">
          <Reveal>
            <div className="center-header">
              <div className="section-eyebrow">
                <Shield size={14} />
                <span>The STAR BYTE Advantage</span>
              </div>
              <h2 className="section-title">Why Professionals Choose STAR BYTE</h2>
              <p className="section-subtitle">
                Engineered for developers, designers, researchers, and creators who need uninterrupted access to premium digital tools.
              </p>
            </div>
          </Reveal>

          <div className="why-grid-3">
            {WHY_STAR_BYTE.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="why-saas-card">
                    <div className="why-card-top">
                      <div className="why-icon-box" style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}35` }}>
                        <Icon size={24} />
                      </div>
                      <span className="why-tag-pill" style={{ color: item.color, background: `${item.color}12`, borderColor: `${item.color}30` }}>
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="why-card-title">{item.title}</h3>
                    <p className="why-card-desc">{item.desc}</p>
                    <div className="why-card-accent-bar" style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }} />
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS (4-STEP TIMELINE) ===================== */}
      <section className="section how-section">
        <div className="container">
          <Reveal>
            <div className="center-header">
              <div className="section-eyebrow">
                <Zap size={14} />
                <span>Seamless Experience</span>
              </div>
              <h2 className="section-title">Up and Running in Minutes</h2>
              <p className="section-subtitle">
                A streamlined 4-step process designed for instant speed, effortless onboarding, and guaranteed security.
              </p>
            </div>
          </Reveal>

          <div className="timeline-container">
            {/* Animated Connecting Glowing Line */}
            <div className="timeline-glow-line" />

            <div className="timeline-steps-grid">
              {HOW_IT_WORKS_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <Reveal key={i} delay={i * 0.12}>
                    <div className="timeline-step-card">
                      <div className="timeline-step-num-bubble">
                        <span>{step.step}</span>
                      </div>
                      <div className="timeline-icon-sphere">
                        <StepIcon size={24} />
                      </div>
                      <h3 className="timeline-step-title">{step.title}</h3>
                      <p className="timeline-step-desc">{step.desc}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS (SINGLE CAROUSEL) ===================== */}
      <section className="section reviews-section">
        <div className="container">
          <Reveal>
            <div className="reviews-header-row">
              <div>
                <div className="section-eyebrow">
                  <Star size={14} />
                  <span>Real Customer Experiences</span>
                </div>
                <h2 className="section-title">What Our Customers Say</h2>
                <p className="section-subtitle">
                  Thousands of satisfied engineers, agencies, and digital professionals trust STAR BYTE.
                </p>
              </div>

              {/* Carousel Navigation Buttons */}
              <div className="carousel-nav-buttons">
                <button
                  className="carousel-btn"
                  onClick={prevReview}
                  aria-label="Previous review"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="carousel-btn"
                  onClick={nextReview}
                  aria-label="Next review"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </Reveal>

          {/* Testimonial Cards Carousel Grid */}
          <div className="reviews-carousel-grid">
            {[0, 1, 2].map((offset) => {
              const reviewIndex = (currentReviewIndex + offset) % REVIEWS.length;
              const review = REVIEWS[reviewIndex];
              return (
                <Reveal key={`${review.name}-${reviewIndex}`} delay={offset * 0.1}>
                  <div className="review-glass-card">
                    <div className="review-top-row">
                      <div className="review-avatar-wrap">
                        <div className="review-avatar-circle">{review.avatar}</div>
                        <div>
                          <h4 className="review-customer-name">{review.name}</h4>
                          <span className="review-customer-role">{review.role}</span>
                        </div>
                      </div>
                      <div className="review-stars-row">
                        {Array.from({ length: review.rating }).map((_, j) => (
                          <Star key={j} size={15} fill="#fbbf24" color="#fbbf24" />
                        ))}
                      </div>
                    </div>

                    <div className="review-product-tag">
                      <Package size={12} />
                      <span>{review.product}</span>
                    </div>

                    <p className="review-body-text">"{review.text}"</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== FAQ ACCORDION ===================== */}
      <section className="section faq-section">
        <div className="container" style={{ maxWidth: 840 }}>
          <Reveal>
            <div className="center-header">
              <div className="section-eyebrow">
                <Sparkles size={14} />
                <span>Got Questions?</span>
              </div>
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle">
                Everything you need to know about our subscriptions, fulfillment, and warranty.
              </p>
            </div>
          </Reveal>

          <div className="faq-accordion-list">
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <Reveal key={i} delay={i * 0.05}>
                  <div className={`faq-accordion-card ${isOpen ? 'active-faq' : ''}`}>
                    <button
                      className="faq-toggle-btn"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-q-text">{item.question}</span>
                      <div className="faq-icon-indicator">
                        {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          className="faq-answer-collapse"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="faq-answer-content">
                            <p>{item.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.3}>
            <div className="faq-support-box">
              <p>Still have questions about a specific subscription?</p>
              <div className="faq-support-actions">
                <Link to="/contact" className="btn btn-outline btn-sm">Contact Support</Link>
                <a
                  href={`https://wa.me/${whatsappNum}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-glass btn-sm"
                >
                  <MessageCircle size={15} />
                  <span>Ask on WhatsApp</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="section final-cta-section">
        <div className="container">
          <Reveal>
            <div className="final-universe-cta">
              {/* Radial Backdrop Glow */}
              <div className="cta-radial-glow" />

              {/* Transparent Glowing Star Logo */}
              <div className="cta-logo-wrap">
                <img
                  src="/logo.png"
                  alt="STAR BYTE"
                  className="cta-glowing-star"
                />
              </div>

              <h2 className="final-cta-heading">Enter the STAR BYTE Universe.</h2>
              <p className="final-cta-subheading">
                Unlock instant access to top-tier digital subscriptions at unbeatable prices. 
                Experience premium digital performance today.
              </p>

              <div className="final-cta-actions">
                <Link to="/products" className="btn btn-primary btn-lg cta-explore-btn">
                  <span>Explore Subscriptions</span>
                  <ArrowRight size={18} />
                </Link>
                <a
                  href={`https://wa.me/${whatsappNum}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-lg cta-whatsapp-btn"
                >
                  <MessageCircle size={18} />
                  <span>WhatsApp Us</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer settings={settings} />

      <style>{`
        .starbyte-app-wrapper {
          background-color: var(--color-bg);
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        /* Hero */
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero-3d-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .hero-fallback-bg {
          width: 100%;
          height: 100%;
          background: #04060f;
          position: relative;
        }

        .hero-fallback-radial {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 40%, rgba(99, 102, 241, 0.18) 0%, transparent 70%);
        }

        .hero-ambient-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 70% at 50% 40%, rgba(4, 6, 15, 0) 0%, rgba(4, 6, 15, 0.8) 85%);
          pointer-events: none;
          z-index: 2;
        }

        .hero-content {
          position: relative;
          text-align: center;
          padding: calc(var(--navbar-height) + 40px) var(--space-6) 70px;
          max-width: 960px;
          width: 100%;
          z-index: 3;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 999px;
          padding: 6px 18px;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-primary-light);
          letter-spacing: 0.08em;
          margin-bottom: var(--space-6);
          backdrop-filter: blur(12px);
        }

        .glow-dot-cyan {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #06b6d4;
          box-shadow: 0 0 10px #06b6d4;
        }

        .hero-headline {
          font-size: clamp(2.6rem, 6.5vw, 5.2rem);
          font-weight: 900;
          font-family: var(--font-display);
          line-height: 1.08;
          margin-bottom: var(--space-6);
          color: var(--color-text-primary);
          letter-spacing: -0.03em;
        }

        .gradient-text-hero {
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 40%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 25px rgba(99, 102, 241, 0.4));
        }

        .hero-subtitle {
          font-size: clamp(1.05rem, 2.2vw, 1.25rem);
          color: var(--color-text-secondary);
          max-width: 680px;
          margin: 0 auto var(--space-8);
          line-height: 1.7;
        }

        .hero-buttons-group {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: var(--space-12);
        }

        .hero-cta-btn {
          min-width: 220px;
        }

        .hero-whatsapp-btn {
          min-width: 190px;
        }

        .hero-metrics-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
          background: rgba(13, 18, 37, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-2xl);
          padding: 16px 32px;
          max-width: 760px;
          margin: 0 auto;
          backdrop-filter: blur(16px);
        }

        .metric-item {
          text-align: center;
        }

        .metric-val {
          font-size: 1.5rem;
          font-weight: 800;
          font-family: var(--font-display);
          background: linear-gradient(135deg, #ffffff, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
        }

        .metric-lbl {
          font-size: 0.72rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
          margin-top: 3px;
        }

        .metric-separator {
          width: 1px;
          height: 28px;
          background: rgba(255, 255, 255, 0.1);
        }

        .hero-scroll-cue {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          color: var(--color-text-muted);
          z-index: 4;
        }

        /* Trust Strip */
        .trust-strip {
          background: rgba(8, 12, 26, 0.85);
          border-top: 1px solid rgba(99, 102, 241, 0.12);
          border-bottom: 1px solid rgba(99, 102, 241, 0.12);
          padding: 24px 0;
          backdrop-filter: blur(16px);
        }

        .trust-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .trust-cell {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .trust-cell-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .trust-cell-info h4 {
          font-size: 0.925rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 2px;
          font-family: var(--font-sans);
        }

        .trust-cell-info p {
          font-size: 0.78rem;
          color: var(--color-text-muted);
          line-height: 1.4;
        }

        /* Featured Section */
        .featured-section {
          background: var(--color-bg);
          position: relative;
        }

        .section-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .center-header {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 52px;
        }

        .section-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-primary-light);
          margin-bottom: 8px;
        }

        .center-header .section-eyebrow {
          justify-content: center;
        }

        .section-title {
          font-size: clamp(1.8rem, 3.8vw, 2.75rem);
          font-weight: 800;
          font-family: var(--font-display);
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 12px;
        }

        .section-subtitle {
          font-size: 1rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        .filter-chips-scroll {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 16px;
          margin-bottom: 32px;
          scrollbar-width: none;
        }

        .filter-chips-scroll::-webkit-scrollbar {
          display: none;
        }

        .filter-chip {
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 0.825rem;
          font-weight: 600;
          cursor: pointer;
          background: rgba(13, 18, 37, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--color-text-secondary);
          transition: all 0.25s ease;
          white-space: nowrap;
        }

        .filter-chip:hover {
          background: rgba(99, 102, 241, 0.12);
          color: var(--color-text-primary);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .filter-chip.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(6, 182, 212, 0.25));
          border-color: var(--color-primary-light);
          color: #fff;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
        }

        /* Spotlight Flagship Card */
        .spotlight-card {
          position: relative;
          background: rgba(13, 18, 37, 0.8);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: var(--radius-3xl);
          overflow: hidden;
          margin-bottom: 40px;
          box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.8), 0 0 40px -10px rgba(99, 102, 241, 0.25);
        }

        .spotlight-glow {
          position: absolute;
          top: -100px;
          left: -100px;
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
          pointer-events: none;
        }

        .spotlight-inner {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 36px;
          padding: 32px;
          align-items: center;
        }

        .spotlight-thumb-wrap {
          position: relative;
          border-radius: var(--radius-2xl);
          overflow: hidden;
          background: #080c1a;
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spotlight-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .spotlight-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: rgba(99, 102, 241, 0.9);
          backdrop-filter: blur(10px);
          color: #ffffff;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .spotlight-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .spotlight-cat {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-primary-light);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .spotlight-delivery {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 600;
        }

        .spotlight-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: #ffffff;
          font-family: var(--font-display);
          margin-bottom: 10px;
        }

        .spotlight-desc {
          font-size: 0.925rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .spotlight-features-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 28px;
        }

        .spotlight-feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--color-text-primary);
        }

        .spotlight-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .spotlight-price {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .spotlight-curr {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-primary-light);
        }

        .spotlight-amount {
          font-size: 2.1rem;
          font-weight: 900;
          font-family: var(--font-display);
          color: #ffffff;
        }

        .spotlight-orig {
          font-size: 1.05rem;
          color: var(--color-text-muted);
          text-decoration: line-through;
        }

        .featured-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        /* Why STAR BYTE */
        .why-section {
          background: rgba(8, 12, 26, 0.6);
          border-top: 1px solid rgba(99, 102, 241, 0.12);
          border-bottom: 1px solid rgba(99, 102, 241, 0.12);
        }

        .why-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .why-saas-card {
          position: relative;
          background: rgba(13, 18, 37, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-2xl);
          padding: 32px 28px;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .why-saas-card:hover {
          transform: translateY(-6px);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 30px -5px rgba(99, 102, 241, 0.2);
        }

        .why-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .why-icon-box {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .why-tag-pill {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid transparent;
        }

        .why-card-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 10px;
          font-family: var(--font-display);
        }

        .why-card-desc {
          font-size: 0.885rem;
          color: var(--color-text-secondary);
          line-height: 1.65;
        }

        .why-card-accent-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          opacity: 0.7;
        }

        /* Timeline */
        .how-section {
          background: var(--color-bg);
          position: relative;
        }

        .timeline-container {
          position: relative;
          margin-top: 40px;
        }

        .timeline-glow-line {
          position: absolute;
          top: 36px;
          left: 5%;
          right: 5%;
          height: 2px;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.2), #6366f1 50%, rgba(16, 185, 129, 0.2));
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
          z-index: 1;
        }

        .timeline-steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          position: relative;
          z-index: 2;
        }

        .timeline-step-card {
          text-align: center;
          padding: 24px 20px;
          background: rgba(13, 18, 37, 0.75);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: var(--radius-2xl);
          transition: all 0.3s ease;
        }

        .timeline-step-card:hover {
          transform: translateY(-6px);
          border-color: rgba(99, 102, 241, 0.35);
          box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.7);
        }

        .timeline-step-num-bubble {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #080c1a;
          border: 2px solid var(--color-primary-light);
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--color-primary-light);
          margin-bottom: 18px;
        }

        .timeline-icon-sphere {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2));
          border: 1px solid rgba(99, 102, 241, 0.4);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          box-shadow: 0 0 24px rgba(99, 102, 241, 0.3);
        }

        .timeline-step-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 8px;
          font-family: var(--font-display);
        }

        .timeline-step-desc {
          font-size: 0.825rem;
          color: var(--color-text-secondary);
          line-height: 1.55;
        }

        /* Reviews Carousel */
        .reviews-section {
          background: rgba(8, 12, 26, 0.6);
          border-top: 1px solid rgba(99, 102, 241, 0.12);
          border-bottom: 1px solid rgba(99, 102, 241, 0.12);
        }

        .reviews-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .carousel-nav-buttons {
          display: flex;
          gap: 10px;
        }

        .carousel-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(13, 18, 37, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .carousel-btn:hover {
          background: var(--color-primary);
          border-color: var(--color-primary);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
        }

        .reviews-carousel-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .review-glass-card {
          background: rgba(13, 18, 37, 0.75);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-2xl);
          padding: 28px;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: all 0.3s ease;
        }

        .review-glass-card:hover {
          border-color: rgba(99, 102, 241, 0.35);
          box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.6);
        }

        .review-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .review-avatar-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .review-avatar-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #06b6d4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 800;
          color: #ffffff;
        }

        .review-customer-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1.2;
        }

        .review-customer-role {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .review-stars-row {
          display: flex;
          gap: 3px;
        }

        .review-product-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-primary-light);
          margin-bottom: 16px;
          width: fit-content;
        }

        .review-body-text {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.65;
          font-style: italic;
        }

        /* FAQ */
        .faq-section {
          background: var(--color-bg);
        }

        .faq-accordion-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .faq-accordion-card {
          background: rgba(13, 18, 37, 0.75);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-xl);
          overflow: hidden;
          transition: border-color 0.25s ease;
        }

        .faq-accordion-card.active-faq {
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 8px 30px -10px rgba(99, 102, 241, 0.2);
        }

        .faq-toggle-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 20px 24px;
          background: transparent;
          border: none;
          color: var(--color-text-primary);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          font-family: var(--font-sans);
        }

        .faq-icon-indicator {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary-light);
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .faq-accordion-card.active-faq .faq-icon-indicator {
          background: rgba(99, 102, 241, 0.2);
          color: #ffffff;
        }

        .faq-answer-collapse {
          overflow: hidden;
        }

        .faq-answer-content {
          padding: 0 24px 22px;
        }

        .faq-answer-content p {
          font-size: 0.925rem;
          color: var(--color-text-secondary);
          line-height: 1.7;
        }

        .faq-support-box {
          text-align: center;
          margin-top: 48px;
          padding: 24px;
          background: rgba(13, 18, 37, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-2xl);
        }

        .faq-support-box p {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          margin-bottom: 16px;
        }

        .faq-support-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Final Universe CTA */
        .final-cta-section {
          background: var(--color-bg);
          position: relative;
        }

        .final-universe-cta {
          text-align: center;
          padding: 72px 32px;
          position: relative;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(6, 182, 212, 0.06) 100%);
          border: 1px solid rgba(99, 102, 241, 0.28);
          border-radius: var(--radius-3xl);
          overflow: hidden;
          box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.8), 0 0 60px -10px rgba(99, 102, 241, 0.25);
        }

        .cta-radial-glow {
          position: absolute;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.1) 40%, transparent 70%);
          pointer-events: none;
        }

        .cta-logo-wrap {
          margin-bottom: 24px;
          display: flex;
          justify-content: center;
        }

        .cta-glowing-star {
          height: 90px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 0 35px rgba(99, 102, 241, 0.75));
          animation: floatSlow 4s ease-in-out infinite;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .final-cta-heading {
          font-size: clamp(2rem, 4.5vw, 3.2rem);
          font-weight: 900;
          font-family: var(--font-display);
          background: linear-gradient(135deg, #ffffff 0%, #c084fc 50%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .final-cta-subheading {
          font-size: 1.1rem;
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto 36px;
          line-height: 1.65;
        }

        .final-cta-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-explore-btn { min-width: 220px; }
        .cta-whatsapp-btn { min-width: 190px; }

        /* Skeletons */
        .products-grid-skeleton {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .skeleton-card {
          height: 340px;
          background: linear-gradient(90deg, #0d1225 25%, #141c37 50%, #0d1225 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: var(--radius-2xl);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1200px) {
          .featured-cards-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 1024px) {
          .trust-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .spotlight-inner { grid-template-columns: 1fr; }
          .why-grid-3 { grid-template-columns: repeat(2, 1fr); }
          .timeline-steps-grid { grid-template-columns: repeat(2, 1fr); }
          .timeline-glow-line { display: none; }
          .reviews-carousel-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .trust-grid-4 { grid-template-columns: 1fr; }
          .featured-cards-grid { grid-template-columns: repeat(2, 1fr); }
          .why-grid-3 { grid-template-columns: 1fr; }
          .timeline-steps-grid { grid-template-columns: 1fr; }
          .reviews-carousel-grid { grid-template-columns: 1fr; }
          .hero-metrics-bar { gap: 16px; padding: 14px 20px; }
          .final-universe-cta { padding: 48px 20px; }
        }

        @media (max-width: 480px) {
          .featured-cards-grid { grid-template-columns: 1fr; }
          .hero-buttons-group { flex-direction: column; width: 100%; }
          .hero-cta-btn, .hero-whatsapp-btn { width: 100%; }
          .final-cta-actions { flex-direction: column; width: 100%; }
          .cta-explore-btn, .cta-whatsapp-btn { width: 100%; }
        }

        /* =====================================================
           LIGHT MODE OVERRIDES FOR HOMEPAGE
           ===================================================== */
        [data-theme='light'] .starbyte-app-wrapper {
          background-color: #f8faff;
        }

        [data-theme='light'] .hero-fallback-bg {
          background: #f8faff;
        }

        [data-theme='light'] .hero-fallback-radial {
          background: radial-gradient(ellipse 70% 60% at 50% 40%, rgba(99, 102, 241, 0.12) 0%, transparent 70%);
        }

        [data-theme='light'] .hero-ambient-vignette {
          background: radial-gradient(ellipse 80% 70% at 50% 40%, rgba(248, 250, 255, 0.05) 0%, rgba(248, 250, 255, 0.88) 85%);
        }

        [data-theme='light'] .hero-eyebrow {
          background: rgba(99, 102, 241, 0.08);
          border-color: rgba(99, 102, 241, 0.25);
          color: #4338ca;
        }

        [data-theme='light'] .hero-headline {
          color: #0f172a;
        }

        [data-theme='light'] .gradient-text-hero {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0891b2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.25));
        }

        [data-theme='light'] .hero-subtitle {
          color: #334155;
        }

        [data-theme='light'] .hero-metrics-bar {
          background: #ffffff;
          border: 1px solid rgba(99, 102, 241, 0.18);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.08);
        }

        [data-theme='light'] .metric-val {
          background: linear-gradient(135deg, #1e1b4b, #4338ca);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        [data-theme='light'] .metric-lbl {
          color: #64748b;
        }

        [data-theme='light'] .metric-separator {
          background: rgba(99, 102, 241, 0.15);
        }

        [data-theme='light'] .trust-strip {
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.12);
        }

        [data-theme='light'] .trust-cell-info h4 {
          color: #0f172a;
        }

        [data-theme='light'] .trust-cell-info p {
          color: #475569;
        }

        [data-theme='light'] .section-title {
          color: #0f172a;
        }

        [data-theme='light'] .section-subtitle {
          color: #475569;
        }

        [data-theme='light'] .filter-chip {
          background: #ffffff;
          border: 1px solid rgba(99, 102, 241, 0.16);
          color: #334155;
        }

        [data-theme='light'] .filter-chip:hover {
          background: rgba(99, 102, 241, 0.08);
          color: #4338ca;
        }

        [data-theme='light'] .filter-chip.active {
          background: linear-gradient(135deg, #4f46e5, #06b6d4);
          color: #ffffff;
          border-color: transparent;
        }

        [data-theme='light'] .spotlight-card {
          background: #ffffff;
          border: 1px solid rgba(99, 102, 241, 0.2);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.12);
        }

        [data-theme='light'] .spotlight-title {
          color: #0f172a;
        }

        [data-theme='light'] .spotlight-desc {
          color: #475569;
        }

        [data-theme='light'] .spotlight-amount {
          color: #0f172a;
        }

        [data-theme='light'] .spotlight-feature-item {
          color: #1e293b;
        }

        [data-theme='light'] .why-section {
          background: #f0f4ff;
          border-color: rgba(99, 102, 241, 0.12);
        }

        [data-theme='light'] .why-saas-card {
          background: #ffffff;
          border: 1px solid rgba(99, 102, 241, 0.14);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.06);
        }

        [data-theme='light'] .why-card-title {
          color: #0f172a;
        }

        [data-theme='light'] .why-card-desc {
          color: #475569;
        }

        [data-theme='light'] .how-section {
          background: #f8faff;
        }

        [data-theme='light'] .timeline-step-card {
          background: #ffffff;
          border: 1px solid rgba(99, 102, 241, 0.14);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.06);
        }

        [data-theme='light'] .timeline-step-title {
          color: #0f172a;
        }

        [data-theme='light'] .timeline-step-desc {
          color: #475569;
        }

        [data-theme='light'] .timeline-step-num-bubble {
          background: #f8faff;
          border-color: #6366f1;
          color: #4338ca;
        }

        [data-theme='light'] .reviews-section {
          background: #f0f4ff;
          border-color: rgba(99, 102, 241, 0.12);
        }

        [data-theme='light'] .review-glass-card {
          background: #ffffff;
          border: 1px solid rgba(99, 102, 241, 0.14);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.06);
        }

        [data-theme='light'] .review-customer-name {
          color: #0f172a;
        }

        [data-theme='light'] .review-customer-role {
          color: #64748b;
        }

        [data-theme='light'] .review-body-text {
          color: #334155;
        }

        [data-theme='light'] .carousel-btn {
          background: #ffffff;
          color: #1e293b;
          border-color: rgba(99, 102, 241, 0.2);
        }

        [data-theme='light'] .faq-section {
          background: #f8faff;
        }

        [data-theme='light'] .faq-accordion-card {
          background: #ffffff;
          border: 1px solid rgba(99, 102, 241, 0.14);
        }

        [data-theme='light'] .faq-toggle-btn {
          color: #0f172a;
        }

        [data-theme='light'] .faq-answer-content p {
          color: #334155;
        }

        [data-theme='light'] .faq-icon-indicator {
          background: rgba(99, 102, 241, 0.08);
          color: #4f46e5;
        }

        [data-theme='light'] .faq-support-box {
          background: #ffffff;
          border: 1px solid rgba(99, 102, 241, 0.14);
        }

        [data-theme='light'] .faq-support-box p {
          color: #475569;
        }

        [data-theme='light'] .final-universe-cta {
          background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%);
          border: 1px solid rgba(99, 102, 241, 0.25);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.12);
        }

        [data-theme='light'] .final-cta-heading {
          background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 60%, #0891b2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        [data-theme='light'] .final-cta-subheading {
          color: #475569;
        }
      `}</style>
    </div>
  );
}

