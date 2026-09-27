import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, Send, CheckCircle, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ContactPage({ theme, toggleTheme }) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const setField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) errs.email = 'Valid email is required';
    if (!formData.subject.trim()) errs.subject = 'Subject is required';
    if (!formData.message.trim() || formData.message.length < 20) errs.message = 'Message must be at least 20 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/settings/contact', formData);
      setSent(true);
      toast.success('Message sent successfully!');
    } catch (err) {
      toast.error('Failed to send message. Please try WhatsApp instead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div style={{ paddingTop: 'calc(var(--navbar-height) + 80px)', paddingBottom: 80 }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
              <Mail size={14} />
              Get In Touch
            </div>
            <h1 className="section-title" style={{ textAlign: 'center' }}>Contact Support</h1>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Our team is ready to help. Reach out via WhatsApp for the fastest response.
            </p>
          </motion.div>

          <div className="contact-layout">
            {/* Contact info */}
            <div className="contact-info">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="contact-info-card glass-card">
                  <h2 className="contact-info-title">Connect With Us</h2>
                  <p className="contact-info-desc">
                    For fastest support, reach us directly on WhatsApp. 
                    We're typically available during business hours and respond within minutes.
                  </p>

                  <div className="contact-methods">
                    <a
                      href="https://wa.me/923327775418"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-method whatsapp"
                    >
                      <div className="contact-method-icon" style={{ background: 'rgba(37,211,102,0.1)', color: '#25d366' }}>
                        <MessageCircle size={22} />
                      </div>
                      <div>
                        <div className="contact-method-label">WhatsApp (+92 332 7775418)</div>
                        <div className="contact-method-value">Fastest response • Available Now</div>
                      </div>
                    </a>

                    <a
                      href="mailto:astrabytepk@gmail.com"
                      className="contact-method"
                    >
                      <div className="contact-method-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                        <Mail size={22} />
                      </div>
                      <div>
                        <div className="contact-method-label">Email Support</div>
                        <div className="contact-method-value">astrabytepk@gmail.com</div>
                      </div>
                    </a>
                  </div>

                  <div className="contact-hours">
                    <div className="contact-hours-title">Business Hours</div>
                    <div className="contact-hours-row">
                      <span>Monday — Friday</span>
                      <span>9:00 AM — 9:00 PM</span>
                    </div>
                    <div className="contact-hours-row">
                      <span>Saturday — Sunday</span>
                      <span>10:00 AM — 6:00 PM</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
                {sent ? (
                  <div className="empty-state">
                    <div className="empty-state-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                      <CheckCircle size={32} />
                    </div>
                    <div className="empty-state-title">Message Sent!</div>
                    <div className="empty-state-subtitle">
                      We've received your message and will get back to you as soon as possible.
                    </div>
                    <button className="btn btn-glass" onClick={() => setSent(false)}>
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-6)', fontFamily: 'var(--font-display)' }}>
                      Send a Message
                    </h2>

                    <div className="contact-form-grid">
                      <div className="form-group">
                        <label className="form-label">Your Name *</label>
                        <input
                          type="text"
                          className={`form-input ${errors.name ? 'error' : ''}`}
                          placeholder="Full name"
                          value={formData.name}
                          onChange={e => setField('name', e.target.value)}
                        />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Email Address *</label>
                        <input
                          type="email"
                          className={`form-input ${errors.email ? 'error' : ''}`}
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={e => setField('email', e.target.value)}
                        />
                        {errors.email && <span className="form-error">{errors.email}</span>}
                      </div>

                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Subject *</label>
                        <input
                          type="text"
                          className={`form-input ${errors.subject ? 'error' : ''}`}
                          placeholder="What is this regarding?"
                          value={formData.subject}
                          onChange={e => setField('subject', e.target.value)}
                        />
                        {errors.subject && <span className="form-error">{errors.subject}</span>}
                      </div>

                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Message *</label>
                        <textarea
                          className={`form-input ${errors.message ? 'error' : ''}`}
                          placeholder="Describe your question or issue in detail..."
                          value={formData.message}
                          onChange={e => setField('message', e.target.value)}
                          style={{ minHeight: 140 }}
                        />
                        {errors.message && <span className="form-error">{errors.message}</span>}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      style={{ width: '100%', marginTop: 'var(--space-4)' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <><div className="spinner" style={{ width: 16, height: 16 }} /> Sending...</>
                      ) : (
                        <><Send size={16} /> Send Message</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        .contact-layout {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: var(--space-8);
          align-items: start;
        }

        .contact-info-card {
          padding: var(--space-8);
          height: 100%;
        }

        .contact-info-title {
          font-size: 1.1rem;
          font-weight: 700;
          font-family: var(--font-display);
          margin-bottom: var(--space-3);
        }

        .contact-info-desc {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.7;
          margin-bottom: var(--space-6);
        }

        .contact-methods {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }

        .contact-method {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
          background: rgba(99,102,241,0.04);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .contact-method.whatsapp:hover {
          border-color: #25d366;
          background: rgba(37,211,102,0.05);
        }

        .contact-method-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          background: rgba(99,102,241,0.1);
          color: var(--color-primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .contact-method-label {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 2px;
        }

        .contact-method-value {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .contact-hours {
          padding: var(--space-4);
          background: rgba(99,102,241,0.04);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
        }

        .contact-hours-title {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
          margin-bottom: var(--space-3);
        }

        .contact-hours-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          padding: var(--space-2) 0;
          border-bottom: 1px solid rgba(99,102,241,0.05);
        }

        .contact-hours-row:last-child { border-bottom: none; }

        .contact-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .form-input.error {
          border-color: var(--color-error);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
        }

        @media (max-width: 768px) {
          .contact-layout { grid-template-columns: 1fr; }
          .contact-form-grid { grid-template-columns: 1fr; }
        }

        /* Light mode overrides for ContactPage */
        [data-theme='light'] .contact-info-card,
        [data-theme='light'] .glass-card {
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.16);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.06);
        }

        [data-theme='light'] .contact-info-title {
          color: #0f172a;
        }

        [data-theme='light'] .contact-info-desc {
          color: #334155;
        }

        [data-theme='light'] .contact-method-name {
          color: #0f172a;
        }

        [data-theme='light'] .contact-hours {
          background: #f8faff;
          border-color: rgba(99, 102, 241, 0.16);
        }

        [data-theme='light'] .contact-hours-row {
          color: #334155;
        }
      `}</style>
    </div>
  );
}
