import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { getUserOrders, type Order, type ProductOrder } from '../lib/orders';

const PRODUCT_TYPES = ['subdomain', 'website', 'portfolio'] as const;

function isProductOrder(order: Order): order is ProductOrder {
  return PRODUCT_TYPES.includes(order.type as any);
}

export default function MyProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        const orders = await getUserOrders(user.uid);
        const filtered = orders.filter(isProductOrder);
        setProducts(filtered);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'subdomain':
        return 'Subdomain';
      case 'website':
        return 'Website';
      case 'portfolio':
        return 'Portfolio';
      default:
        return type;
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

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'var(--mono)',
        fontSize: '0.875rem',
        color: 'var(--muted)',
      }}>
        Loading products...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
        <p style={{
          fontFamily: 'var(--display)',
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--ink)',
          margin: '0 0 0.5rem',
        }}>
          No products yet
        </p>
        <p style={{
          fontFamily: 'var(--body)',
          fontSize: '0.875rem',
          color: 'var(--muted)',
          margin: '0 0 1.5rem',
        }}>
          Purchase a product to see it here.
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
          Browse Products
        </a>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border)',
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
          My Products
        </h3>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '0.75rem',
          color: 'var(--muted)',
          background: 'var(--border)',
          padding: '4px 8px',
          borderRadius: '4px',
        }}>
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </span>
      </div>

      {/* Product list */}
      <div>
        {products.map((order, index) => {
          const badge = getStatusBadge(order.status);
          return (
            <div
              key={order.id || index}
              style={{
                padding: '1rem 1.5rem',
                borderBottom: index < products.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '1rem',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.35rem',
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontFamily: 'var(--body)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: 'var(--ink)',
                  }}>
                    {getTypeLabel(order.type)}
                    {order.details?.subdomain ? `: ${order.details.subdomain}` : ''}
                  </span>
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
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                }}>
                  Purchased {formatDate(order.createdAt)}
                </div>
              </div>

              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--ink)',
                textAlign: 'right',
                whiteSpace: 'nowrap',
              }}>
                -{order.tokensUsed} 🪙
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
