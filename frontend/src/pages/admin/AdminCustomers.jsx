import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Search, Mail, Phone, Calendar,
  ShieldCheck, RefreshCw, ChevronLeft, ChevronRight,
  ShoppingCart, ExternalLink, UserCheck, UserX
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (search) params.set('search', search);

      const res = await api.get(`/admin/customers?${params}`);
      setCustomers(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const getInitials = (firstName, lastName, email) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName.slice(0, 2).toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return 'U';
  };

  return (
    <div className="admin-customers-page">
      {/* Header */}
      <div className="customers-header">
        <div>
          <h1 className="admin-page-title">Customers</h1>
          <p className="admin-page-subtitle">{total} registered client accounts</p>
        </div>
        <button className="btn btn-glass btn-sm" onClick={fetchCustomers}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="customers-toolbar">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* Table Container */}
      <div className="admin-card">
        {loading ? (
          <div className="table-loading-skeleton">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-row" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} className="empty-icon" />
            <h3>No customers found</h3>
            <p>Customer accounts created through the registration page will appear here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact Info</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const initials = getInitials(customer.firstName, customer.lastName, customer.email);
                  const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Anonymous User';
                  const phone = customer.whatsapp || customer.phone;

                  return (
                    <motion.tr
                      key={customer._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Customer Profile */}
                      <td>
                        <div className="customer-profile-cell">
                          <div className="customer-avatar-circle">
                            {initials}
                          </div>
                          <div>
                            <div className="customer-name-text">{fullName}</div>
                            <div className="customer-email-sub">{customer.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td>
                        <div className="contact-cell">
                          <a href={`mailto:${customer.email}`} className="contact-link">
                            <Mail size={12} /> {customer.email}
                          </a>
                          {phone && (
                            <a
                              href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="contact-link wa"
                            >
                              <Phone size={12} /> {phone}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td>
                        <span className={`role-badge ${customer.role === 'admin' ? 'admin' : 'user'}`}>
                          {customer.role === 'admin' ? <ShieldCheck size={12} /> : null}
                          {customer.role || 'customer'}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td>
                        <div className="date-cell">
                          <Calendar size={13} className="date-icon" />
                          <span>
                            {new Date(customer.createdAt).toLocaleDateString(undefined, {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        {customer.isActive !== false ? (
                          <span className="status-pill active">
                            <UserCheck size={12} /> Active
                          </span>
                        ) : (
                          <span className="status-pill inactive">
                            <UserX size={12} /> Suspended
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="actions-cell">
                          <Link
                            to={`/admin/orders?search=${encodeURIComponent(customer.email)}`}
                            className="action-btn"
                            title="View Orders by this customer"
                          >
                            <ShoppingCart size={14} />
                            <span>Orders</span>
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="admin-pagination">
            <span className="pagination-info">
              Page {page} of {pages} ({total} customers)
            </span>
            <div className="pagination-buttons">
              <button
                className="btn btn-glass btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                className="btn btn-glass btn-sm"
                disabled={page >= pages}
                onClick={() => setPage(p => Math.min(pages, p + 1))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-customers-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .customers-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .customers-toolbar {
          display: flex;
          align-items: center;
          background: rgba(13, 18, 37, 0.6);
          backdrop-filter: blur(12px);
          padding: var(--space-4);
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-border);
        }

        .search-form {
          position: relative;
          width: 100%;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
        }

        .search-input {
          width: 100%;
          background: rgba(7, 11, 24, 0.7);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 10px 14px 10px 38px;
          color: var(--color-text-primary);
          font-size: 0.875rem;
          outline: none;
        }
        .search-input:focus {
          border-color: var(--color-primary);
        }

        .admin-card {
          background: rgba(13, 18, 37, 0.6);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          backdrop-filter: blur(12px);
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th {
          background: rgba(7, 11, 24, 0.5);
          padding: 14px 18px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted);
          border-bottom: 1px solid var(--color-border);
        }

        .admin-table td {
          padding: 16px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          vertical-align: middle;
        }

        .admin-table tbody tr:hover {
          background: rgba(99, 102, 241, 0.03);
        }

        .customer-profile-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .customer-avatar-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--gradient-brand);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .customer-name-text {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--color-text-primary);
        }
        .customer-email-sub {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .contact-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .contact-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          text-decoration: none;
        }
        .contact-link:hover {
          color: var(--color-primary-light);
          text-decoration: underline;
        }
        .contact-link.wa {
          color: #10b981;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .role-badge.admin {
          background: rgba(99, 102, 241, 0.15);
          color: var(--color-primary-light);
          border: 1px solid rgba(99, 102, 241, 0.3);
        }
        .role-badge.user {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-text-muted);
          border: 1px solid var(--color-border);
        }

        .date-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 600;
        }
        .status-pill.active {
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }
        .status-pill.inactive {
          background: rgba(239, 68, 68, 0.12);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .actions-cell {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-lg);
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: var(--color-primary-light);
          font-size: 0.8rem;
          font-weight: 500;
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .action-btn:hover {
          background: rgba(99, 102, 241, 0.2);
          color: #fff;
          border-color: var(--color-primary);
        }

        .admin-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-top: 1px solid var(--color-border);
          background: rgba(7, 11, 24, 0.4);
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: var(--color-text-muted);
        }
        .empty-icon {
          margin-bottom: 16px;
          opacity: 0.4;
        }
        .empty-state h3 {
          font-size: 1.1rem;
          color: var(--color-text-primary);
          margin-bottom: 6px;
        }

        .table-loading-skeleton {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .skeleton-row {
          height: 48px;
          border-radius: var(--radius-lg);
          background: rgba(255, 255, 255, 0.04);
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
