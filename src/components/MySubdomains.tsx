import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { getUserOrders, type Order, type ProductOrder } from '../lib/orders';

export default function MySubdomains() {
  const { user } = useAuth();
  const [subdomains, setSubdomains] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubdomains([]);
      setLoading(false);
      return;
    }

    const fetchSubdomains = async () => {
      try {
        const orders = await getUserOrders(user.uid);
        const filtered = orders.filter(
          (o): o is ProductOrder => o.type === 'subdomain'
        );
        setSubdomains(filtered);
      } catch (err) {
        console.error('Failed to fetch subdomains:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubdomains();
  }, [user]);

  if (!user) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return { bg: 'color-mix(in srgb, #22c55e 15%, transparent)', color: '#22c55e', label: 'Active' };
      case 'pending':
        return { bg: 'color-mix(in srgb, #E8A33D 15%, transparent)', color: '#E8A33D', label: 'Pending' };
      case 'rejected':
        return { bg: 'color-mix(in srgb, #ff6b6b 15%, transparent)', color: '#ff6b6b', label: 'Expired' };
      default:
        return { bg: 'color-mix(in srgb, var(--muted) 15%, transparent)', color: 'var(--muted)', label: status };
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCopyCname = (subdomain: string, id: string) => {
    const cname = `${subdomain}.myanmardev.com`;
    navigator.clipboard.writeText(cname).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = cname;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'var(--mono)',
        fontSize: '0.875rem',
        color: 'var(--muted)',
      }}>
        Loading subdomains...
      </div>
    );
  }

  if (subdomains.length === 0) {
    return (
      <div style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        background: 'var(--wash)',
        border: '1px solid #1D232B',
        borderRadius: '12px',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌐</div>
        <p style={{
          fontFamily: 'var(--display)',
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--ink)',
          margin: '0 0 0.5rem',
        }}>
          No subdomains yet
        </p>
        <p style={{
          fontFamily: 'var(--body)',
          fontSize: '0.875rem',
          color: 'var(--muted)',
          margin: '0 0 1.5rem',
        }}>
          Register a free subdomain for your project.
        </p>
        <a
          href="/#product"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'var(--accent)',
            color: 'var(--base)',
            border: 'none',
            borderRadius: '6px',
            fontFamily: 'var(--mono)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
        >
          Create Subdomain
        </a>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--wash)',
      border: '1px solid #1D232B',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #1D232B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h3 style={{
          fontFamily: 'var(--display)',
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--ink)',
          margin: 0,
        }}>
          My Subdomains
        </h3>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '0.75rem',
          color: 'var(--muted)',
          background: '#1D232B',
          padding: '4px 8px',
          borderRadius: '4px',
        }}>
          {subdomains.length} {subdomains.length === 1 ? 'subdomain' : 'subdomains'}
        </span>
      </div>

      {/* Column labels */}
      <div style={{
        padding: '0.5rem 1.5rem',
        borderBottom: '1px solid #1D232B',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
        gap: '1rem',
        alignItems: 'center',
      }}>
        {['Subdomain', 'Platform', 'Status', 'Created', ''].map((label) => (
          <span key={label} style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {label}
          </span>
        ))}
      </div>

      {/* Subdomain rows */}
      {subdomains.map((order, index) => {
        const badge = getStatusBadge(order.status);
        const subdomainName = order.details?.subdomain || 'unknown';
        const platform = order.details?.platform || 'N/A';
        const orderId = order.id || String(index);

        return (
          <div
            key={orderId}
            style={{
              padding: '0.875rem 1.5rem',
              borderBottom: index < subdomains.length - 1 ? '1px solid #1D232B' : 'none',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            {/* Subdomain name */}
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--ink)',
            }}>
              {subdomainName}.myanmardev.com
            </div>

            {/* Platform */}
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.8125rem',
              color: 'var(--muted)',
              textTransform: 'capitalize',
            }}>
              {platform}
            </div>

            {/* Status */}
            <div>
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: badge.color,
                background: badge.bg,
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {badge.label}
              </span>
            </div>

            {/* Created date */}
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.8125rem',
              color: 'var(--muted)',
            }}>
              {formatDate(order.createdAt)}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => window.open(`https://${subdomainName}.myanmardev.com`, '_blank')}
                title="View subdomain"
                style={{
                  padding: '0.4rem 0.6rem',
                  background: 'transparent',
                  color: 'var(--ink)',
                  border: '1px solid #1D232B',
                  borderRadius: '4px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--accent)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#1D232B';
                  e.currentTarget.style.color = 'var(--ink)';
                }}
              >
                View
              </button>
              <button
                onClick={() => handleCopyCname(subdomainName, orderId)}
                title="Copy CNAME"
                style={{
                  padding: '0.4rem 0.6rem',
                  background: copiedId === orderId
                    ? 'color-mix(in srgb, #22c55e 15%, transparent)'
                    : 'transparent',
                  color: copiedId === orderId ? '#22c55e' : 'var(--ink)',
                  border: `1px solid ${copiedId === orderId ? '#22c55e' : '#1D232B'}`,
                  borderRadius: '4px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  if (copiedId !== orderId) {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--accent)';
                  }
                }}
                onMouseOut={(e) => {
                  if (copiedId !== orderId) {
                    e.currentTarget.style.borderColor = '#1D232B';
                    e.currentTarget.style.color = 'var(--ink)';
                  }
                }}
              >
                {copiedId === orderId ? 'Copied!' : 'Copy CNAME'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
