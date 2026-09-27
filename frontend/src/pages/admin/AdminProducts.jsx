import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Star, StarOff, Package, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import useAdminStore from '../../stores/adminStore';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const { token } = useAdminStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const limit = 15;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit, sort: '-createdAt' });
      if (search) params.set('search', search);
      const res = await api.get(`/admin/products?${params}`);
      setProducts(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const toggleFeatured = async (product) => {
    try {
      await api.patch(`/admin/products/${product._id}/toggle-featured`);
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isFeatured: !p.isFeatured } : p));
      toast.success(`${product.name} ${!product.isFeatured ? 'featured' : 'unfeatured'}`);
    } catch {
      toast.error('Failed to update product');
    }
  };

  const toggleActive = async (product) => {
    try {
      await api.patch(`/admin/products/${product._id}/toggle-active`);
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isActive: !p.isActive } : p));
      toast.success(`${product.name} ${!product.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      setTotal(t => t - 1);
      setDeleteId(null);
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">{total} products in your catalog</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div className="search-bar" style={{ maxWidth: 400 }}>
          <Search size={16} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-section">
        <div className="table-container">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }} />
            </div>
          ) : products.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="product-thumb">
                          {product.thumbnail ? (
                            <img src={product.thumbnail} alt={product.name} />
                          ) : (
                            <div className="product-thumb-placeholder">
                              {product.name?.[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{product.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                        {product.category?.name || '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>${(Number(product.price) || 0).toFixed(2)}</div>
                      {product.originalPrice ? (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                          ${(Number(product.originalPrice) || 0).toFixed(2)}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <span className={`badge status-${product.stockStatus || 'in_stock'}`} style={{ fontSize: '0.7rem' }}>
                        {(product.stockStatus || 'in_stock').replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <button
                        className="icon-btn"
                        onClick={() => toggleFeatured(product)}
                        title={product.isFeatured ? 'Remove from featured' : 'Add to featured'}
                      >
                        {product.isFeatured
                          ? <Star size={18} fill="#fbbf24" color="#fbbf24" />
                          : <StarOff size={18} color="var(--color-text-muted)" />
                        }
                      </button>
                    </td>
                    <td>
                      <button
                        className="icon-btn"
                        onClick={() => toggleActive(product)}
                        title={product.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {product.isActive
                          ? <Eye size={18} color="var(--color-success)" />
                          : <EyeOff size={18} color="var(--color-text-muted)" />
                        }
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="icon-btn"
                          onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => setDeleteId(product._id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><Package size={24} /></div>
              <div className="empty-state-title">No products found</div>
              <Link to="/admin/products/new" className="btn btn-primary btn-sm">Add First Product</Link>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="pagination" style={{ justifyContent: 'flex-start', marginTop: 'var(--space-4)' }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`page-btn ${p === page ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >{p}</button>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <motion.div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 style={{ marginBottom: 8, fontFamily: 'var(--font-display)' }}>Delete Product</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-glass" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button
                className="btn"
                style={{ flex: 1, background: 'var(--color-error)', color: 'white' }}
                onClick={() => handleDelete(deleteId)}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        .admin-page-title { font-size: 1.5rem; font-weight: 800; font-family: var(--font-display); margin-bottom: 4px; }
        .admin-page-subtitle { font-size: 0.9rem; color: var(--color-text-muted); }

        .product-thumb {
          width: 44px;
          height: 32px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--color-bg-tertiary);
          flex-shrink: 0;
        }

        .product-thumb img { width: 100%; height: 100%; object-fit: cover; }

        .product-thumb-placeholder {
          width: 100%;
          height: 100%;
          background: var(--gradient-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.8rem;
          color: var(--color-primary-light);
          font-family: var(--font-display);
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
        }

        .icon-btn:hover { background: rgba(99,102,241,0.1); color: var(--color-primary-light); }
        .icon-btn.danger:hover { background: rgba(239,68,68,0.1); color: var(--color-error); }
      `}</style>
    </div>
  );
}
