import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const FAQ_CATEGORIES = [
  {
    category: 'Getting Started',
    items: [
      { q: 'What is STAR BYTE?', a: 'STAR BYTE is a premium subscription hub offering verified digital subscriptions at unbeatable prices. We provide access to AI tools, creative platforms, entertainment services, VPN, and much more — all from one place.' },
      { q: 'How do I place an order?', a: 'Browse our subscription catalog, add items to your cart, then proceed to checkout. You can pay by card or place your order via WhatsApp for a more personalized experience.' },
      { q: 'Do I need an account to purchase?', a: 'You can browse and explore without an account, but creating one allows you to track your orders, save your details, and access order history.' },
    ]
  },
  {
    category: 'Delivery',
    items: [
      { q: 'How quickly are subscriptions delivered?', a: 'Most subscriptions are delivered within minutes to a few hours after payment confirmation. We deliver via WhatsApp or email depending on the product.' },
      { q: 'How will I receive my subscription credentials?', a: 'Subscription access details are sent via WhatsApp by our team after your order is confirmed. Some products may also be sent by email.' },
      { q: 'What if I don\'t receive my order?', a: 'If you haven\'t received your subscription within the expected time, contact us immediately on WhatsApp and we\'ll resolve it quickly.' },
    ]
  },
  {
    category: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept card payments (Visa, Mastercard, Amex) via secure Stripe processing, as well as direct WhatsApp orders for flexible payment options.' },
      { q: 'Is my payment information secure?', a: 'Absolutely. Card payments are processed by Stripe, a PCI-compliant payment processor. We never store your card details on our servers.' },
      { q: 'Can I get a refund?', a: 'Due to the digital nature of our products, refunds are handled case by case. Contact our support team and we\'ll do our best to help.' },
    ]
  },
  {
    category: 'Subscriptions',
    items: [
      { q: 'Are these official subscriptions?', a: 'Yes. All subscriptions we offer are genuine and functional. We source through verified channels and test every product before listing.' },
      { q: 'What if my subscription stops working?', a: 'Products with a warranty are fully covered. Contact our WhatsApp support with your order details and we\'ll replace or resolve it promptly.' },
      { q: 'Can I renew my subscription?', a: 'Yes! Simply visit our store and place a new order for the same product when your subscription is about to expire. Contact us on WhatsApp for renewal reminders.' },
      { q: 'Can I share a subscription?', a: 'That depends on the specific subscription plan you purchase. Some plans support multiple users or devices. Details are included in each product description.' },
    ]
  }
];

export default function FAQPage({ theme, toggleTheme }) {
  const [openItems, setOpenItems] = useState({});

  const toggle = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div style={{ paddingTop: 'calc(var(--navbar-height) + 80px)', paddingBottom: 80 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
              <HelpCircle size={14} />
              Support Center
            </div>
            <h1 className="section-title" style={{ textAlign: 'center' }}>Frequently Asked Questions</h1>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Everything you need to know about STAR BYTE and our premium subscriptions.
            </p>
          </motion.div>

          {FAQ_CATEGORIES.map((category, catIdx) => (
            <motion.div
              key={catIdx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIdx * 0.1 }}
              style={{ marginBottom: 48 }}
            >
              <h2 className="faq-category-title">{category.category}</h2>
              <div className="faq-list">
                {category.items.map((item, itemIdx) => {
                  const key = `${catIdx}-${itemIdx}`;
                  const isOpen = openItems[key];
                  return (
                    <div key={itemIdx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                      <button
                        className="faq-question"
                        onClick={() => toggle(catIdx, itemIdx)}
                        aria-expanded={isOpen}
                      >
                        <span>{item.q}</span>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={18} />
                        </motion.div>
                      </button>
                      <motion.div
                        className="faq-answer"
                        initial={false}
                        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p>{item.a}</p>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Still need help */}
          <motion.div
            className="faq-help-box"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="faq-help-title">Still have questions?</h2>
            <p className="faq-help-subtitle">Our team is available to help you via WhatsApp or email.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-primary">
                <Mail size={16} /> Contact Us
              </Link>
              <a
                href="https://wa.me/923327775418"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <MessageCircle size={16} /> WhatsApp Support
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />

      <style>{`
        .faq-category-title {
          font-size: 1.1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-primary-light);
          margin-bottom: var(--space-4);
          font-family: var(--font-sans);
          padding-left: var(--space-2);
          border-left: 3px solid var(--color-primary);
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .faq-item {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          transition: border-color var(--transition-fast);
        }

        .faq-item.open { border-color: var(--color-primary); }

        .faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          padding: var(--space-5) var(--space-6);
          background: transparent;
          border: none;
          color: var(--color-text-primary);
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          font-family: var(--font-sans);
        }

        .faq-answer {
          padding: 0 var(--space-6) var(--space-5);
        }

        .faq-answer p {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.7;
        }

        .faq-help-box {
          text-align: center;
          padding: var(--space-12);
          background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06));
          border: 1px solid var(--color-border);
          border-radius: var(--radius-3xl);
        }

        .faq-help-title {
          font-size: 1.5rem;
          font-weight: 800;
          font-family: var(--font-display);
          margin-bottom: var(--space-3);
        }

        .faq-help-subtitle {
          font-size: 0.9375rem;
          color: var(--color-text-secondary);
          margin-bottom: var(--space-6);
        }

        /* Light mode overrides for FAQPage */
        [data-theme='light'] .faq-item {
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.16);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.05);
        }

        [data-theme='light'] .faq-question {
          color: #0f172a;
        }

        [data-theme='light'] .faq-answer p {
          color: #334155;
        }

        [data-theme='light'] .faq-help-box {
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.18);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.08);
        }

        [data-theme='light'] .faq-help-title {
          color: #0f172a;
        }

        [data-theme='light'] .faq-help-subtitle {
          color: #475569;
        }
      `}</style>
    </div>
  );
}
