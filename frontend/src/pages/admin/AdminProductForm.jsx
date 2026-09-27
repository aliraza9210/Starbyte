import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Plus, Trash2, Upload, X } from 'lucide-react';
import api from '../../services/api';
import useAdminStore from '../../stores/adminStore';
import toast from 'react-hot-toast';

const EMPTY_PLAN = { name: '', duration: '', price: '', originalPrice: '', isDefault: false };
const STOCK_STATUSES = ['in_stock', 'out_of_stock', 'pre_order', 'limited'];
const DELIVERY_METHODS = ['whatsapp', 'email', 'manual'];

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { token } = useAdminStore();
  const headers = { 'X-Admin-Token': token };

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    currency: 'USD',
    stockStatus: 'in_stock',
    deliveryMethod: 'whatsapp',
    duration: '',
    warranty: '',
    thumbnail: '',
    images: [],
    plans: [],
    features: [''],
    tags: '',
    isFeatured: false,
    isActive: true,
    faq: [],
  });

  useEffect(() => {
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    // Fetch categories
    api.get('/admin/categories', { headers: authHeaders })
      .catch(() => api.get('/categories'))
      .then(res => {
        setCategories(res.data.data || []);
      })
      .catch(() => {});

    // Load product if editing
    if (isEditing) {
      setLoading(true);
      // Try /admin/products/:id first, fallback to /products/:id
      api.get(`/admin/products/${id}`, { headers: authHeaders })
        .catch(() => api.get(`/products/${id}`))
        .then(res => {
          const p = res.data.data;
          if (!p) {
            toast.error('Product data is empty');
            navigate('/admin/products');
            return;
          }
          setForm({
            name: p.name || '',
            slug: p.slug || '',
            shortDescription: p.shortDescription || '',
            description: p.description || '',
            category: p.category?._id || p.category || '',
            price: p.price ?? '',
            originalPrice: p.originalPrice ?? '',
            currency: p.currency || 'USD',
            stockStatus: p.stockStatus || 'in_stock',
            deliveryMethod: p.deliveryMethod || 'whatsapp',
            duration: p.duration || '',
            warranty: p.warranty || '',
            thumbnail: p.thumbnail || '',
            images: p.images || [],
            plans: p.plans || [],
            features: p.features?.length ? p.features : [''],
            tags: (p.tags || []).join(', '),
            isFeatured: p.isFeatured || false,
            isActive: p.isActive !== false,
            faq: p.faq || [],
          });
        })
        .catch((err) => {
          console.error('Failed to load product for edit:', err);
          toast.error(err.response?.data?.message || 'Failed to load product');
          navigate('/admin/products');
        })
        .finally(() => setLoading(false));
    }
  }, [id, token]);

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handlePriceChange = (val) => {
    setForm(prev => {
      const nextPlans = prev.plans.length === 1
        ? [{ ...prev.plans[0], price: val }]
        : prev.plans;
      return { ...prev, price: val, plans: nextPlans };
    });
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setField('name', name);
    if (!isEditing || !form.slug) {
      setField('slug', generateSlug(name));
    }
  };

  // Plans management
  const addPlan = () => setField('plans', [...form.plans, { ...EMPTY_PLAN }]);
  const updatePlan = (i, field, value) => {
    const plans = [...form.plans];
    plans[i] = { ...plans[i], [field]: value };
    setField('plans', plans);
  };
  const removePlan = (i) => setField('plans', form.plans.filter((_, idx) => idx !== i));

  // Features management
  const addFeature = () => setField('features', [...form.features, '']);
  const updateFeature = (i, value) => {
    const features = [...form.features];
    features[i] = value;
    setField('features', features);
  };
  const removeFeature = (i) => setField('features', form.features.filter((_, idx) => idx !== i));

  // FAQ management
  const addFaq = () => setField('faq', [...form.faq, { question: '', answer: '' }]);
  const updateFaq = (i, field, value) => {
    const faq = [...form.faq];
    faq[i] = { ...faq[i], [field]: value };
    setField('faq', faq);
  };
  const removeFaq = (i) => setField('faq', form.faq.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.price) { toast.error('Price is required'); return; }
    if (!form.category) { toast.error('Category is required'); return; }

    setSaving(true);
    try {
      const cleanSlug = (form.slug || form.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      let updatedPlans = form.plans.map(p => ({
        ...p,
        price: parseFloat(p.price) || 0,
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : undefined
      }));

      // If single plan, keep in sync with product price
      if (updatedPlans.length === 1) {
        updatedPlans[0].price = parseFloat(form.price);
        if (form.originalPrice) {
          updatedPlans[0].originalPrice = parseFloat(form.originalPrice);
        }
      }

      const payload = {
        ...form,
        slug: cleanSlug,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        features: form.features.filter(f => f.trim()),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        plans: updatedPlans
      };

      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      if (isEditing) {
        await api.put(`/admin/products/${id}`, payload, { headers: authHeaders });
        toast.success('Product updated successfully');
      } else {
        await api.post('/admin/products', payload, { headers: authHeaders });
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (err) {
      console.error('Save product error:', err);
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  const FormSection = ({ title, children }) => (
    <div className="form-section">
      <h2 className="form-section-title">{title}</h2>
      {children}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <Link to="/admin/products" className="btn btn-glass btn-sm">
          <ArrowLeft size={14} /> Back
        </Link>
        <div>
          <h1 className="admin-page-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="admin-page-subtitle">
            {isEditing ? `Editing: ${form.name}` : 'Fill in the details to add a new subscription product.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="product-form-layout">
          {/* Main column */}
          <div className="product-form-main">
            <FormSection title="Basic Information">
              <div className="form-grid-2">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ChatGPT Plus"
                    value={form.name}
                    onChange={handleNameChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug / URL Key</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.slug}
                    onChange={e => setField('slug', e.target.value)}
                    placeholder="auto-generated"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-input"
                    value={form.category}
                    onChange={e => setField('category', e.target.value)}
                    required
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Short Description</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Brief one-line description"
                    value={form.shortDescription}
                    onChange={e => setField('shortDescription', e.target.value)}
                    maxLength={150}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Full Description</label>
                  <textarea
                    className="form-input"
                    placeholder="Detailed product description..."
                    value={form.description}
                    onChange={e => setField('description', e.target.value)}
                    style={{ minHeight: 120 }}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Pricing & Availability">
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={form.price}
                    onChange={e => handlePriceChange(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Original Price (for discount)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={form.originalPrice}
                    onChange={e => setField('originalPrice', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    className="form-input"
                    value={form.currency}
                    onChange={e => setField('currency', e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Status</label>
                  <select
                    className="form-input"
                    value={form.stockStatus}
                    onChange={e => setField('stockStatus', e.target.value)}
                  >
                    {STOCK_STATUSES.map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 1 Month, 1 Year"
                    value={form.duration}
                    onChange={e => setField('duration', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Warranty</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 1 Month Replacement"
                    value={form.warranty}
                    onChange={e => setField('warranty', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Delivery Method</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {DELIVERY_METHODS.map(m => (
                      <button
                        key={m}
                        type="button"
                        className={`delivery-option ${form.deliveryMethod === m ? 'selected' : ''}`}
                        onClick={() => setField('deliveryMethod', m)}
                      >
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Plans */}
            <FormSection title="Subscription Plans (Optional)">
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                If you have multiple plan options (monthly, annual, etc.), add them here. Leave empty to use the main price above.
              </p>
              {form.plans.map((plan, i) => (
                <div key={i} className="plan-form-row">
                  <div className="form-grid-3" style={{ flex: 1 }}>
                    <div className="form-group">
                      <label className="form-label">Plan Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Monthly"
                        value={plan.name}
                        onChange={e => updatePlan(i, 'name', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Duration</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="1 Month"
                        value={plan.duration}
                        onChange={e => updatePlan(i, 'duration', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price *</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0.00"
                        value={plan.price}
                        onChange={e => updatePlan(i, 'price', e.target.value)}
                        min="0" step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Original Price</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0.00"
                        value={plan.originalPrice}
                        onChange={e => updatePlan(i, 'originalPrice', e.target.value)}
                        min="0" step="0.01"
                      />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={plan.isDefault}
                          onChange={e => {
                            const plans = form.plans.map((p, idx) => ({ ...p, isDefault: idx === i ? e.target.checked : false }));
                            setField('plans', plans);
                          }}
                        />
                        <span className="form-label" style={{ margin: 0 }}>Default</span>
                      </label>
                    </div>
                  </div>
                  <button type="button" className="icon-btn danger" onClick={() => removePlan(i)} style={{ alignSelf: 'flex-start', marginTop: 28 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-glass btn-sm" onClick={addPlan}>
                <Plus size={14} /> Add Plan
              </button>
            </FormSection>

            {/* Features */}
            <FormSection title="Product Features">
              {form.features.map((feature, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Feature ${i + 1}...`}
                    value={feature}
                    onChange={e => updateFeature(i, e.target.value)}
                  />
                  {form.features.length > 1 && (
                    <button type="button" className="icon-btn danger" onClick={() => removeFeature(i)}>
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-glass btn-sm" onClick={addFeature}>
                <Plus size={14} /> Add Feature
              </button>
            </FormSection>

            {/* FAQ */}
            <FormSection title="Product FAQ (Optional)">
              {form.faq.map((item, i) => (
                <div key={i} className="faq-form-row">
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Question..."
                      value={item.question}
                      onChange={e => updateFaq(i, 'question', e.target.value)}
                    />
                    <textarea
                      className="form-input"
                      placeholder="Answer..."
                      value={item.answer}
                      onChange={e => updateFaq(i, 'answer', e.target.value)}
                      style={{ minHeight: 70 }}
                    />
                  </div>
                  <button type="button" className="icon-btn danger" onClick={() => removeFaq(i)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-glass btn-sm" onClick={addFaq}>
                <Plus size={14} /> Add FAQ Item
              </button>
            </FormSection>
          </div>

          {/* Sidebar column */}
          <div className="product-form-sidebar">
            {/* Status */}
            <div className="form-section">
              <h2 className="form-section-title">Visibility</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[
                  { field: 'isActive', label: 'Active (visible in store)' },
                  { field: 'isFeatured', label: 'Featured (shown on homepage)' },
                ].map(item => (
                  <label key={item.field} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form[item.field]}
                      onChange={e => setField(item.field, e.target.checked)}
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Media */}
            <div className="form-section">
              <h2 className="form-section-title">Media</h2>
              <div className="form-group">
                <label className="form-label">Thumbnail Image (Path or URL)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="/products/chatgpt-plus.svg or https://..."
                  value={form.thumbnail}
                  onChange={e => setField('thumbnail', e.target.value)}
                />
                {form.thumbnail && (
                  <img
                    src={form.thumbnail}
                    alt="Thumbnail preview"
                    style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 8, marginTop: 8, border: '1px solid var(--color-border)' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="form-section">
              <h2 className="form-section-title">Tags</h2>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ai, productivity, chatgpt..."
                  value={form.tags}
                  onChange={e => setField('tags', e.target.value)}
                />
              </div>
            </div>

            {/* Save button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={saving}
            >
              {saving ? (
                <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving...</>
              ) : (
                <><Save size={18} /> {isEditing ? 'Update Product' : 'Create Product'}</>
              )}
            </button>
          </div>
        </div>
      </form>

      <style>{`
        .admin-page-title { font-size: 1.5rem; font-weight: 800; font-family: var(--font-display); margin-bottom: 4px; }
        .admin-page-subtitle { font-size: 0.9rem; color: var(--color-text-muted); }

        .product-form-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: var(--space-5);
          align-items: start;
        }

        .product-form-main {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .product-form-sidebar {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
          position: sticky;
          top: calc(64px + var(--space-4));
        }

        .form-section {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
        }

        .form-section-title {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-secondary);
          margin-bottom: var(--space-5);
          font-family: var(--font-sans);
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--color-border);
        }

        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
        .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4); }

        .plan-form-row {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
          padding: var(--space-4);
          background: rgba(99,102,241,0.04);
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-border);
          margin-bottom: var(--space-3);
        }

        .faq-form-row {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
          padding: var(--space-4);
          background: rgba(99,102,241,0.04);
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-border);
          margin-bottom: var(--space-3);
        }

        .delivery-option {
          padding: 8px 16px;
          border-radius: var(--radius-lg);
          background: rgba(99,102,241,0.04);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-sans);
        }

        .delivery-option:hover { border-color: var(--color-primary); }
        .delivery-option.selected {
          background: rgba(99,102,241,0.12);
          border-color: var(--color-primary);
          color: var(--color-primary-light);
          font-weight: 600;
        }

        .icon-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .icon-btn:hover { background: rgba(99,102,241,0.1); color: var(--color-primary-light); }
        .icon-btn.danger:hover { background: rgba(239,68,68,0.1); color: var(--color-error); }

        @media (max-width: 1024px) {
          .product-form-layout { grid-template-columns: 1fr; }
          .product-form-sidebar { position: relative; top: auto; }
          .form-grid-3 { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 640px) {
          .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
