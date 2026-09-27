import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Plus, Pencil, Trash2, CheckCircle,
  XCircle, ArrowUpDown, X, Layers, Save,
  RefreshCw, Sparkles
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PRESET_ICONS = [
  'Brain', 'Palette', 'Film', 'Shield', 'Briefcase',
  'GraduationCap', 'Zap', 'Cpu', 'Music', 'Cloud', 'Globe', 'Lock'
];

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Brain',
    color: '#6366f1',
    sortOrder: 0,
    isActive: true
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data.data || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      icon: 'Brain',
      color: '#6366f1',
      sortOrder: categories.length * 10,
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      icon: cat.icon || 'Brain',
      color: cat.color || '#6366f1',
      sortOrder: cat.sortOrder || 0,
      isActive: cat.isActive !== false
    });
    setModalOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({
      ...prev,
      name: val,
      slug: !editingCategory ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : prev.slug
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    if (!form.slug.trim()) {
      toast.error('Category slug is required');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        const res = await api.put(`/admin/categories/${editingCategory._id}`, form);
        setCategories(prev => prev.map(c => c._id === editingCategory._id ? res.data.data : c));
        toast.success('Category updated successfully');
      } else {
        const res = await api.post('/admin/categories', form);
        setCategories(prev => [...prev, res.data.data]);
        toast.success('Category created successfully');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this category?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
      toast.success('Category deactivated');
    } catch {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="admin-categories-page">
      {/* Header */}
      <div className="categories-header">
        <div>
          <h1 className="admin-page-title">Categories Management</h1>
          <p className="admin-page-subtitle">Organize and display product subscription categories</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-glass btn-sm" onClick={fetchCategories}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <div className="categories-skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-categories-card">
          <Tag size={48} className="empty-icon" />
          <h3>No categories created yet</h3>
          <p>Click "Add Category" above to create your first subscription category.</p>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((cat) => (
            <motion.div
              key={cat._id}
              className={`category-item-card ${!cat.isActive ? 'inactive' : ''}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="cat-card-top">
                <div
                  className="cat-icon-badge"
                  style={{ background: `${cat.color || '#6366f1'}22`, color: cat.color || '#6366f1' }}
                >
                  <Tag size={20} />
                </div>
                <div className="cat-status-badge">
                  {cat.isActive ? (
                    <span className="badge-active"><CheckCircle size={12} /> Active</span>
                  ) : (
                    <span className="badge-inactive"><XCircle size={12} /> Inactive</span>
                  )}
                </div>
              </div>

              <div className="cat-card-body">
                <h3 className="cat-name">{cat.name}</h3>
                <code className="cat-slug">/{cat.slug}</code>
                {cat.description && (
                  <p className="cat-desc">{cat.description}</p>
                )}
              </div>

              <div className="cat-card-footer">
                <span className="cat-order-tag">Order: #{cat.sortOrder ?? 0}</span>
                <div className="cat-card-actions">
                  <button
                    className="action-icon-btn"
                    onClick={() => openEditModal(cat)}
                    title="Edit category"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="action-icon-btn delete"
                    onClick={() => handleDelete(cat._id)}
                    title="Delete category"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit */}
      <AnimatePresence>
        {modalOpen && (
          <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
            <motion.div
              className="modal-box"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="modal-header">
                <h2>{editingCategory ? 'Edit Category' : 'Create Category'}</h2>
                <button className="close-btn" onClick={() => setModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. AI & Productivity"
                    value={form.name}
                    onChange={handleNameChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">URL Slug *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ai-productivity"
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Short description of products in this category..."
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Theme Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="color"
                        value={form.color}
                        onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                        className="color-picker-input"
                      />
                      <input
                        type="text"
                        className="form-input"
                        value={form.color}
                        onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.sortOrder}
                      onChange={(e) => setForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                    <span>Active & Visible in Catalog</span>
                  </label>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-glass"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .admin-categories-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .categories-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-5);
        }

        .category-item-card {
          background: rgba(13, 18, 37, 0.6);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: border-color var(--transition-fast), transform var(--transition-fast);
        }
        .category-item-card:hover {
          border-color: rgba(99, 102, 241, 0.4);
          transform: translateY(-2px);
        }
        .category-item-card.inactive {
          opacity: 0.6;
        }

        .cat-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-4);
        }

        .cat-icon-badge {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .badge-active {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #34d399;
          background: rgba(16, 185, 129, 0.12);
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }
        .badge-inactive {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #f87171;
          background: rgba(239, 68, 68, 0.12);
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .cat-card-body {
          margin-bottom: var(--space-4);
        }
        .cat-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 2px;
        }
        .cat-slug {
          font-size: 0.75rem;
          color: var(--color-primary-light);
          display: inline-block;
          margin-bottom: 8px;
        }
        .cat-desc {
          font-size: 0.825rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }

        .cat-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-3);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .cat-order-tag {
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }

        .cat-card-actions {
          display: flex;
          gap: 6px;
        }

        .action-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .action-icon-btn:hover {
          background: rgba(99, 102, 241, 0.15);
          color: var(--color-primary-light);
          border-color: var(--color-primary);
        }
        .action-icon-btn.delete:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.4);
        }

        .categories-skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-5);
        }
        .skeleton-card {
          height: 180px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-xl);
          animation: pulse 1.5s infinite;
        }

        .empty-categories-card {
          background: rgba(13, 18, 37, 0.6);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: 60px 20px;
          text-align: center;
          color: var(--color-text-muted);
        }
        .empty-categories-card .empty-icon {
          margin-bottom: 16px;
          opacity: 0.4;
        }
        .empty-categories-card h3 {
          color: var(--color-text-primary);
          margin-bottom: 6px;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-box {
          background: #0d1225;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          width: 100%;
          max-width: 520px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid var(--color-border);
        }
        .modal-header h2 {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .close-btn {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
        }
        .close-btn:hover {
          color: var(--color-text-primary);
        }

        .modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-muted);
        }
        .form-input {
          background: rgba(7, 11, 24, 0.8);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 10px 14px;
          color: var(--color-text-primary);
          font-size: 0.85rem;
          outline: none;
        }
        .form-input:focus {
          border-color: var(--color-primary);
        }

        .color-picker-input {
          width: 40px;
          height: 38px;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          background: transparent;
        }

        .checkbox-group {
          margin-top: 4px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          cursor: pointer;
        }

        .modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}
