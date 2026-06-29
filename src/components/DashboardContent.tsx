import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import TokenBalance from './TokenBalance';
import OrderHistory from './OrderHistory';
import BuyTokensModal from './BuyTokensModal';
import RedeemCodeModal from './RedeemCodeModal';

export default function DashboardContent() {
  const { isSignedIn, profile, refreshProfile } = useAuth();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  if (!isSignedIn) {
    return (
      <div style={{
        marginTop: '2rem',
        padding: '3rem',
        textAlign: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--ink)',
          margin: '0 0 0.75rem',
        }}>
          Sign In Required
        </h2>
        <p style={{
          fontFamily: 'var(--body)',
          fontSize: '1rem',
          color: 'var(--muted)',
          margin: '0 0 1.5rem',
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Please sign in with your Google or GitHub account to access your dashboard.
        </p>
        <a href="/" className="btn" style={{ padding: '0.75rem 1.5rem' }}>
          Go to Home Page
        </a>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Welcome Section */}
      <div style={{
        padding: '2rem',
        background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
        borderRadius: '10px',
        marginBottom: '2rem',
      }}>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--ink)',
          margin: '0 0 0.5rem',
        }}>
          Welcome back, {profile?.displayName || profile?.email?.split('@')[0] || 'Developer'}! 👋
        </h2>
        <p style={{
          fontFamily: 'var(--body)',
          fontSize: '0.9375rem',
          color: 'var(--muted)',
          margin: 0,
        }}>
          Here's an overview of your account and recent activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Token Balance Card */}
        <div style={{
          padding: '1.5rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🪙</div>
          <div style={{
            fontFamily: 'var(--display)',
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--accent)',
            marginBottom: '0.25rem',
          }}>
            {profile?.tokenBalance || 0}
          </div>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.75rem',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Tokens Available
          </div>
        </div>

        {/* Quick Actions Card */}
        <div style={{
          padding: '1.5rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
        }}>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem',
          }}>
            Quick Actions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => setShowBuyModal(true)}
              style={{
                padding: '0.75rem',
                background: 'var(--accent)',
                color: 'var(--base)',
                border: 'none',
                borderRadius: '6px',
                fontFamily: 'var(--mono)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Buy Tokens
            </button>
            <button
              onClick={() => setShowRedeemModal(true)}
              style={{
                padding: '0.75rem',
                background: 'transparent',
                color: 'var(--ink)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontFamily: 'var(--mono)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Redeem Code
            </button>
            <a
              href="/#product"
              style={{
                padding: '0.75rem',
                background: 'transparent',
                color: 'var(--ink)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontFamily: 'var(--mono)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textAlign: 'center',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              Create Subdomain
            </a>
          </div>
        </div>

        {/* Account Info Card */}
        <div style={{
          padding: '1.5rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
        }}>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem',
          }}>
            Account Info
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.6875rem',
                color: 'var(--muted)',
                marginBottom: '0.25rem',
              }}>
                Email
              </div>
              <div style={{
                fontFamily: 'var(--body)',
                fontSize: '0.875rem',
                color: 'var(--ink)',
                wordBreak: 'break-all',
              }}>
                {profile?.email || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.6875rem',
                color: 'var(--muted)',
                marginBottom: '0.25rem',
              }}>
                Provider
              </div>
              <div style={{
                fontFamily: 'var(--body)',
                fontSize: '0.875rem',
                color: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                {profile?.provider === 'google' ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--ink)">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </>
                )}
              </div>
            </div>
            {profile?.githubUsername && (
              <div>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--muted)',
                  marginBottom: '0.25rem',
                }}>
                  GitHub Username
                </div>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.875rem',
                  color: 'var(--accent)',
                }}>
                  @{profile.githubUsername}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order History */}
      <OrderHistory client:load />

      {/* Modals */}
      <BuyTokensModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onSuccess={refreshProfile}
      />

      <RedeemCodeModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        onSuccess={refreshProfile}
      />
    </div>
  );
}
