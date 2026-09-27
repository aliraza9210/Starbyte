import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X, ChevronDown, SlidersHorizontal, Package } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-orderCount', label: 'Most Popular' },
  { value: 'name', label: 'Name A-Z' },
];

export default function ProductsPage({ theme, toggleTheme }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const search = searchParams.get('search') || '';
  const featured = searchParams.get('featured') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', 20);
      params.set('sort', sort);
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      if (featured) params.set('featured', featured);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

      const res = await api.get(`/products?${params}`);
      setProducts(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setPages(res.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, category, sort, search, featured, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data || []);
      } catch {}
    };
    fetchCategories();
  }, []);

  const clearFilters = () => {
    setSearchParams({ page: '1', sort: '-createdAt' });
  };

  const hasActiveFilters = category || featured || minPrice || maxPrice || search;

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      {/* Page header */}
      <div className="products-header">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-eyebrow">
              <Package size={14} />
              All Products
            </div>
            <h1 className="section-title">Premium Subscriptions</h1>
            <p className="section-subtitle">
              Browse our complete catalog of verified premium subscriptions.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container">
        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className={`filters-sidebar ${filtersOpen ? 'open' : ''}`}>
            <div className="filters-header">
              <h3 className="filters-title">
                <SlidersHorizontal size={16} />
                Filters
              </h3>
              {hasActiveFilters && (
                <button className="filters-clear" onClick={clearFilters}>
                  Clear All <X size={14} />
                </button>
              )}
            </div>

            {/* Search */}
            <div className="filter-group">
              <label className="filter-label">Search</label>
              <div className="search-bar">
                <Search size={16} color="var(--color-text-muted)" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setParam('search', e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <div className="filter-options">
                <button
                  className={`filter-option ${!category ? 'active' : ''}`}
                  onClick={() => setParam('category', '')}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat._id}
                    className={`filter-option ${category === cat.slug ? 'active' : ''}`}
                    onClick={() => setParam('category', cat.slug)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured */}
            <div className="filter-group">
              <label className="filter-label">Type</label>
              <div className="filter-options">
                <button
                  className={`filter-option ${!featured ? 'active' : ''}`}
                  onClick={() => setParam('featured', '')}
                >
                  All Products
                </button>
                <button
                  className={`filter-option ${featured === 'true' ? 'active' : ''}`}
                  onClick={() => setParam('featured', 'true')}
                >
                  Featured Only
                </button>
              </div>
            </div>

            {/* Price range */}
            <div className="filter-group">
              <label className="filter-label">Price Range</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Min $"
                  value={minPrice}
                  onChange={e => setParam('minPrice', e.target.value)}
                  style={{ padding: '0.5rem 0.75rem' }}
                />
                <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Max $"
                  value={maxPrice}
                  onChange={e => setParam('maxPrice', e.target.value)}
                  style={{ padding: '0.5rem 0.75rem' }}
                />
              </div>
            </div>
          </aside>

          {/* Product list */}
          <div className="products-content">
            {/* Toolbar */}
            <div className="products-toolbar">
              <div className="products-count">
                {loading ? 'Loading...' : `${total} products found`}
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {/* Sort */}
                <div style={{ position: 'relative' }}>
                  <select
                    className="form-input"
                    value={sort}
                    onChange={e => setParam('sort', e.target.value)}
                    style={{ padding: '0.5rem 2rem 0.5rem 0.875rem', appearance: 'none', cursor: 'pointer' }}
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-muted)' }} />
                </div>

                {/* Mobile filter toggle */}
                <button
                  className="btn btn-glass btn-sm mobile-filter-btn"
                  onClick={() => setFiltersOpen(s => !s)}
                >
                  <Filter size={15} />
                  Filters
                </button>
              </div>
            </div>

            {/* Active filters chips */}
            {hasActiveFilters && (
              <div className="active-filters">
                {category && (
                  <span className="filter-chip">
                    {categories.find(c => c.slug === category)?.name || category}
                    <button onClick={() => setParam('category', '')}><X size={12} /></button>
                  </span>
                )}
                {featured && (
                  <span className="filter-chip">
                    Featured
                    <button onClick={() => setParam('featured', '')}><X size={12} /></button>
                  </span>
                )}
                {search && (
                  <span className="filter-chip">
                    "{search}"
                    <button onClick={() => setParam('search', '')}><X size={12} /></button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="filter-chip">
                    ${minPrice || '0'} — ${maxPrice || '∞'}
                    <button onClick={() => { setParam('minPrice', ''); setParam('maxPrice', ''); }}><X size={12} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="products-grid-main">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="glass-card skeleton" style={{ height: 320 }} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <motion.div
                className="products-grid-main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {products.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><Package size={28} /></div>
                <div className="empty-state-title">No products found</div>
                <div className="empty-state-subtitle">
                  Try adjusting your filters or search query.
                </div>
                <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`page-btn ${p === page ? 'active' : ''}`}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', p);
                      setSearchParams(params);
                      window.scrollTo(0, 0);
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        .products-header {
          padding: calc(var(--navbar-height) + 40px) 0 40px;
          border-bottom: 1px solid var(--color-border);
        }

        .products-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: var(--space-8);
          padding: var(--space-8) 0 var(--space-16);
        }

        .filters-sidebar {
          position: sticky;
          top: calc(var(--navbar-height) + 20px);
          height: fit-content;
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
        }

        .filters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .filters-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-primary);
          font-family: var(--font-sans);
        }

        .filters-clear {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.78rem;
          color: var(--color-error);
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-sans);
          padding: 4px 8px;
          border-radius: var(--radius-md);
          transition: background var(--transition-fast);
        }

        .filters-clear:hover { background: rgba(239,68,68,0.1); }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .filter-label {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-secondary);
        }

        .filter-options {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .filter-option {
          padding: 6px 10px;
          border-radius: var(--radius-md);
          background: transparent;
          border: 1px solid transparent;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          text-align: left;
          font-family: var(--font-sans);
          transition: all var(--transition-fast);
        }

        .filter-option:hover { background: rgba(99,102,241,0.08); color: var(--color-text-primary); }
        .filter-option.active {
          background: rgba(99,102,241,0.12);
          border-color: rgba(99,102,241,0.3);
          color: var(--color-primary-light);
          font-weight: 600;
        }

        .products-content { flex: 1; min-width: 0; }

        .products-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-5);
          flex-wrap: wrap;
          gap: var(--space-3);
        }

        .products-count {
          font-size: 0.9rem;
          color: var(--color-text-muted);
        }

        .products-grid-main {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-5);
        }

        .active-filters {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-bottom: var(--space-5);
        }

        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 100px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--color-primary-light);
        }

        .filter-chip button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
        }

        .mobile-filter-btn { display: none; }

        .pagination {
          display: flex;
          justify-content: center;
          gap: var(--space-2);
          margin-top: var(--space-8);
          flex-wrap: wrap;
        }

        .page-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-sans);
        }

        .page-btn:hover { border-color: var(--color-primary); color: var(--color-text-primary); }
        .page-btn.active {
          background: var(--gradient-brand);
          border-color: transparent;
          color: white;
          font-weight: 700;
        }

        @media (max-width: 1024px) {
          .products-grid-main { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .products-layout { grid-template-columns: 1fr; }
          .filters-sidebar {
            position: fixed;
            top: 0;
            left: -100%;
            width: 300px;
            height: 100vh;
            z-index: 500;
            overflow-y: auto;
            border-radius: 0 var(--radius-2xl) var(--radius-2xl) 0;
            transition: left var(--transition-base);
            padding-top: calc(var(--navbar-height) + var(--space-6));
          }
          .filters-sidebar.open { left: 0; }
          .mobile-filter-btn { display: flex; }
        }

        @media (max-width: 480px) {
          .products-grid-main { grid-template-columns: 1fr; }
        }

        /* Light mode overrides for ProductsPage */
        [data-theme='light'] .filters-sidebar {
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.16);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.06);
        }

        [data-theme='light'] .filters-title {
          color: #0f172a;
        }

        [data-theme='light'] .filter-label {
          color: #475569;
        }

        [data-theme='light'] .filter-option {
          color: #334155;
        }

        [data-theme='light'] .filter-option:hover {
          background: rgba(99, 102, 241, 0.08);
          color: #0f172a;
        }

        [data-theme='light'] .filter-option.active {
          background: rgba(99, 102, 241, 0.12);
          color: #4338ca;
          font-weight: 700;
        }

        [data-theme='light'] .products-count {
          color: #64748b;
        }

        [data-theme='light'] .page-btn {
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.18);
          color: #334155;
        }

        [data-theme='light'] .page-btn.active {
          background: var(--gradient-brand);
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}
