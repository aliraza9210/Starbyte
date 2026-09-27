import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Save, Globe, MessageSquare, Share2,
  Shield, Check, RefreshCw, Bell, DollarSign,
  Phone, Mail, Info
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [settingsList, setSettingsList] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      const data = res.data.data || [];
      setSettingsList(data);

      const map = {};
      data.forEach(item => {
        map[item.key] = item.value;
      });
      setFormData(map);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', formData);
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General & Store Info', icon: Globe },
    { id: 'contact', label: 'Support & WhatsApp', icon: MessageSquare },
    { id: 'social', label: 'Social Networks', icon: Share2 },
    { id: 'orders', label: 'Orders & Automation', icon: Shield },
  ];

  return (
    <div className="admin-settings-page">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1 className="admin-page-title">Store Settings</h1>
          <p className="admin-page-subtitle">Configure global store brand, support contacts, and automation rules</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-glass btn-sm" onClick={fetchSettings} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Reset</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || loading}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="settings-form">
        {/* General Tab */}
        {activeTab === 'general' && (
          <motion.div
            className="settings-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="card-section-title">Brand & General Store Info</h2>

            <div className="settings-grid">
              <div className="form-group">
                <label className="form-label">Store Brand Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.storeName || ''}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  placeholder="STAR BYTE"
                />
                <span className="field-hint">The primary brand name displayed across the website.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.tagline || ''}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="YOUR PREMIUM SUBSCRIPTION HUB"
                />
                <span className="field-hint">Official brand slogan shown under the logo and in headers.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Default Currency</label>
                <select
                  className="form-input"
                  value={formData.currency || 'USD'}
                  onChange={(e) => handleChange('currency', e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="PKR">PKR (Rs.)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="USDT">USDT (Crypto)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Announcement Banner Text</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.announcement || ''}
                  onChange={(e) => handleChange('announcement', e.target.value)}
                  placeholder="⚡ Limited Offer: 20% off all AI subscriptions with code STAR20"
                />
                <span className="field-hint">Shown at the top of the homepage when set.</span>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Footer Copyright Notice</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.footerText || ''}
                  onChange={(e) => handleChange('footerText', e.target.value)}
                  placeholder="© 2026 STAR BYTE. All rights reserved."
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Support & Contact Tab */}
        {activeTab === 'contact' && (
          <motion.div
            className="settings-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="card-section-title">Support Channels & Customer Care</h2>

            <div className="settings-grid">
              <div className="form-group">
                <label className="form-label">Official WhatsApp Number</label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-input with-icon"
                    value={formData.whatsappNumber || ''}
                    onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                    placeholder="+92 300 1234567"
                  />
                </div>
                <span className="field-hint">Customers can click this to chat with your support team instantly.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Customer Support Email</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    className="form-input with-icon"
                    value={formData.supportEmail || ''}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                    placeholder="astrabytepk@gmail.com"
                  />
                </div>
                <span className="field-hint">Inquiries and checkout confirmation emails will route through this.</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Social Networks Tab */}
        {activeTab === 'social' && (
          <motion.div
            className="settings-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="card-section-title">Social Media & Community Links</h2>

            <div className="settings-grid">
              <div className="form-group">
                <label className="form-label">Telegram Channel / Support</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.telegramUrl || ''}
                  onChange={(e) => handleChange('telegramUrl', e.target.value)}
                  placeholder="https://t.me/starbyte"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Instagram Profile</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.instagramUrl || ''}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/starbyte"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Twitter / X Profile</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.twitterUrl || ''}
                  onChange={(e) => handleChange('twitterUrl', e.target.value)}
                  placeholder="https://x.com/starbyte"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Facebook Page</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.facebookUrl || ''}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/starbyte"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders & Automation Tab */}
        {activeTab === 'orders' && (
          <motion.div
            className="settings-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="card-section-title">Order Processing Rules</h2>

            <div className="settings-grid">
              <div className="form-group full-width">
                <label className="checkbox-setting-card">
                  <input
                    type="checkbox"
                    checked={!!formData.orderAutoConfirm}
                    onChange={(e) => handleChange('orderAutoConfirm', e.target.checked)}
                  />
                  <div>
                    <div className="checkbox-title">Auto-confirm WhatsApp Orders</div>
                    <div className="checkbox-desc">
                      Automatically mark WhatsApp placed orders as processing rather than pending confirmation.
                    </div>
                  </div>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Minimum Order Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  value={formData.minOrderAmount ?? 0}
                  onChange={(e) => handleChange('minOrderAmount', parseFloat(e.target.value) || 0)}
                />
                <span className="field-hint">Set to 0 to disable minimum order requirement.</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom Save Bar */}
        <div className="settings-bottom-bar">
          <div className="save-status-hint">
            <Info size={15} /> All updates take effect immediately on customer storefront
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving changes...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>

      <style>{`
        .admin-settings-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .settings-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 8px;
          overflow-x: auto;
        }

        .settings-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: var(--radius-lg);
          background: transparent;
          border: 1px solid transparent;
          color: var(--color-text-muted);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .settings-tab-btn:hover {
          color: var(--color-text-primary);
          background: rgba(255, 255, 255, 0.04);
        }
        .settings-tab-btn.active {
          color: var(--color-primary-light);
          background: rgba(99, 102, 241, 0.12);
          border-color: rgba(99, 102, 241, 0.3);
          font-weight: 600;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .settings-card {
          background: rgba(13, 18, 37, 0.6);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          backdrop-filter: blur(12px);
        }

        .card-section-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: var(--space-5);
          padding-bottom: var(--space-3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-5);
        }

        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .form-input {
          background: rgba(7, 11, 24, 0.8);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 10px 14px;
          color: var(--color-text-primary);
          font-size: 0.875rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }
        .form-input:focus {
          border-color: var(--color-primary);
        }

        .input-with-icon {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
        }
        .form-input.with-icon {
          padding-left: 40px;
          width: 100%;
        }

        .field-hint {
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }

        .checkbox-setting-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: rgba(7, 11, 24, 0.4);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: 16px;
          cursor: pointer;
        }
        .checkbox-setting-card input[type="checkbox"] {
          margin-top: 3px;
          width: 18px;
          height: 18px;
          accent-color: var(--color-primary);
        }
        .checkbox-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .checkbox-desc {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-top: 2px;
        }

        .settings-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(13, 18, 37, 0.8);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: 16px 24px;
          backdrop-filter: blur(12px);
          flex-wrap: wrap;
          gap: 12px;
        }

        .save-status-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
