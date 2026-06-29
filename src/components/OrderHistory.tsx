import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { getUserOrders, type Order } from '../lib/orders';

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const userOrders = await getUserOrders(user.uid);
        setOrders(userOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'var(--mono)',
        fontSize: '0.875rem',
        color: 'var(--muted)',
      }}>
        Loading orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📦</div>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: '0.875rem',
          color: 'var(--muted)',
          margin: 0,
        }}>
          No orders yet. Start by creating a subdomain!
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'var(--accent)';
      case 'pending':
        return '#E8A33D';
      case 'rejected':
        return '#ff6b6b';
      default:
        return 'var(--muted)';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'subdomain':
        return '🌐 Subdomain';
      case 'token_purchase':
        return '🪙 Token Purchase';
      case 'website':
        return '🏗️ Website';
      case 'portfolio':
        return '💼 Portfolio';
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
          Order History
        </h3>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '0.75rem',
          color: 'var(--muted)',
          background: 'var(--border)',
          padding: '4px 8px',
          borderRadius: '4px',
        }}>
          {orders.length} orders
        </span>
      </div>

      {/* Orders List */}
      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        {orders.map((order, index) => (
          <div
            key={order.id || index}
            style={{
              padding: '1rem 1.5rem',
              borderBottom: index < orders.length - 1 ? '1px solid var(--border)' : 'none',
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
                marginBottom: '0.25rem',
              }}>
                <span style={{
                  fontFamily: 'var(--body)',
                  fontSize: '0.875rem',
                  color: 'var(--ink)',
                  fontWeight: 500,
                }}>
                  {getTypeLabel(order.type)}
                </span>
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: getStatusColor(order.status),
                  background: `color-mix(in srgb, ${getStatusColor(order.status)} 15%, transparent)`,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {order.status}
                </span>
              </div>

              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.75rem',
                color: 'var(--muted)',
              }}>
                {formatDate(order.createdAt)}
              </div>

              {/* Order Details */}
              {order.type === 'subdomain' && 'details' in order && (
                <div style={{
                  marginTop: '0.5rem',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                }}>
                  {order.details.subdomain} → {order.details.platform}
                </div>
              )}
            </div>

            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: order.type === 'token_purchase' ? 'var(--accent)' : 'var(--ink)',
              textAlign: 'right',
            }}>
              {order.type === 'token_purchase' ? (
                `+${'tokenAmount' in order ? order.tokenAmount : 0} 🪙`
              ) : (
                `-${'tokensUsed' in order ? order.tokensUsed : 0} 🪙`
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
