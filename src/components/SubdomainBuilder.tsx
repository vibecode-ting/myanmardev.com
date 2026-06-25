import React, { useState, useCallback, useEffect } from 'react';
import { checkSubdomain, createSubdomain, getDomains } from '../lib/api';
import { useAuth } from './AuthProvider';
import { deductTokens } from '../lib/auth';
import { createProductOrder } from '../lib/orders';
import SignInModal from './SignInModal';
import BuyTokensModal from './BuyTokensModal';

// ─── Types ──────────────────────────────────────────────

type Step = 1 | 2 | 3;
type Platform = 'github' | 'vercel' | 'netlify' | 'custom';
type Status = 'idle' | 'checking' | 'available' | 'unavailable' | 'creating' | 'success' | 'error';

interface PlatformOption {
  value: Platform;
  label: string;
  description: string;
  cnameTarget: string;
  placeholder: string;
}

const PLATFORMS: PlatformOption[] = [
  { value: 'github', label: 'GitHub Pages', description: 'Host your site on GitHub Pages', cnameTarget: '.github.io', placeholder: 'your-username' },
  { value: 'vercel', label: 'Vercel', description: 'Deploy with Vercel', cnameTarget: 'cname.vercel-dns.com', placeholder: 'your-project' },
  { value: 'netlify', label: 'Netlify', description: 'Deploy on Netlify', cnameTarget: 'netlify.app', placeholder: 'your-site-name' },
  { value: 'custom', label: 'Custom CNAME', description: 'Enter any CNAME target', cnameTarget: '', placeholder: 'your-target.example.com' },
];

const TOKEN_COST = 1; // Cost in tokens for subdomain registration

// ─── Step Indicator ─────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { num: 1, label: 'Subdomain' },
    { num: 2, label: 'Platform' },
    { num: 3, label: 'Deploy' },
  ];

  return (
    <div className="tg-steps">
      {steps.map((s, i) => (
        <React.Fragment key={s.num}>
          <div className={`tg-step${step === s.num ? ' active' : step > s.num ? ' done' : ''}`}>
            <span className="tg-step-num">{step > s.num ? '✓' : s.num}</span>
            <span className="tg-step-label">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`tg-step-line${step > s.num ? ' done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Status Alert ────────────────────────────────────────

function StatusAlert({ status, message }: { status: Status; message: string }) {
  if (status === 'idle') return null;

  const isSuccess = status === 'available' || status === 'success';
  const isError = status === 'unavailable' || status === 'error';
  const isLoading = status === 'checking' || status === 'creating';

  const borderColor = isSuccess
    ? 'color-mix(in srgb, var(--accent) 50%, transparent)'
    : isError
      ? 'color-mix(in srgb, #E8A33D 50%, transparent)'
      : '#1D232B';

  const bg = isSuccess
    ? 'color-mix(in srgb, var(--accent) 8%, transparent)'
    : isError
      ? 'color-mix(in srgb, #E8A33D 8%, transparent)'
      : 'var(--wash)';

  const color = isSuccess ? 'var(--accent)' : isError ? '#E8A33D' : 'var(--muted)';

  return (
    <div style={{ marginTop: '1rem', padding: '0.9rem 1rem', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bg, fontSize: '0.8125rem', color, fontFamily: 'var(--mono)', display: 'flex', alignItems: 'flex-start', gap: '0.6rem', animation: 'tgFadeIn 0.3s ease-out' }}>
      {isLoading && (
        <svg style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '1px', animation: 'tgSpin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" opacity="0.75" />
        </svg>
      )}
      <span>{message}</span>
    </div>
  );
}

// ─── Styles injected once ──────────────────────────────

const INJECTED = 'tg-sb-styles';
if (typeof document !== 'undefined' && !document.getElementById(INJECTED)) {
  const style = document.createElement('style');
  style.id = INJECTED;
  style.textContent = `
    .tg-steps { display:flex; align-items:center; justify-content:center; gap:0; margin-bottom:1.75rem }
    .tg-step { display:flex; align-items:center; gap:.5rem }
    .tg-step-num {
      width:28px; height:28px; border-radius:4px; display:flex; align-items:center; justify-content:center;
      font-family:'JetBrains Mono',monospace; font-size:.75rem; font-weight:700;
      background:var(--wash); color:var(--muted); border:1px solid #1D232B; transition:all .2s
    }
    .tg-step.active .tg-step-num { background:var(--accent); color:var(--base); border-color:var(--accent) }
    .tg-step.done .tg-step-num { background:color-mix(in srgb, var(--accent) 30%, transparent); color:var(--accent); border-color:color-mix(in srgb, var(--accent) 40%, transparent) }
    .tg-step-label { font-family:'JetBrains Mono',monospace; font-size:.6875rem; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; display:none }
    @media(min-width:480px){ .tg-step-label { display:inline } }
    .tg-step.active .tg-step-label { color:var(--accent) }
    .tg-step-line { width:clamp(1.5rem,4vw,3rem); height:1px; background:#1D232B; transition:background .2s }
    .tg-step-line.done { background:color-mix(in srgb, var(--accent) 50%, transparent) }
    @keyframes tgFadeIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:none } }
    @keyframes tgSpin { to { transform:rotate(360deg) } }
    .tg-input {
      width:100%; padding:.75rem 1rem; border:1px solid #1D232B; border-radius:6px;
      background:color-mix(in srgb, var(--base) 80%, #0D1117); color:var(--ink);
      font-family:'JetBrains Mono',monospace; font-size:.875rem; outline:none;
      transition:border-color .2s
    }
    .tg-input:focus { border-color:var(--accent) }
    .tg-input::placeholder { color:var(--muted) }
    .tg-input-suffix {
      display:inline-flex; align-items:center; padding:0 .75rem;
      background:#0D1117; color:var(--muted);
      font-family:'JetBrains Mono',monospace; font-size:.8125rem;
      border:1px solid #1D232B; border-left:0; border-radius:0 6px 6px 0; white-space:nowrap
    }
    .tg-input-group { display:flex; align-items:stretch }
    .tg-input-group .tg-input { border-radius:6px 0 0 6px; border-right:0 }
    .tg-label {
      display:block; font-family:'JetBrains Mono',monospace; font-size:.6875rem;
      font-weight:600; color:var(--ink); margin-bottom:.6rem;
      text-transform:uppercase; letter-spacing:.06em
    }
    .tg-platform-grid { display:grid; grid-template-columns:1fr 1fr; gap:.6rem; margin-bottom:1rem }
    @media(min-width:480px){ .tg-platform-grid { grid-template-columns:repeat(4,1fr) } }
    .tg-platform-btn {
      padding:.7rem .6rem; border-radius:6px; border:1px solid #1D232B;
      background:var(--wash); color:var(--ink); text-align:left;
      font-family:'Inter',system-ui,sans-serif; font-size:.8125rem;
      cursor:pointer; transition:border-color .15s, background .15s
    }
    .tg-platform-btn:hover { border-color:color-mix(in srgb, var(--accent) 40%, transparent) }
    .tg-platform-btn.active { border-color:var(--accent); background:color-mix(in srgb, var(--accent) 10%, transparent) }
    .tg-platform-btn .pl { font-weight:600; font-size:.8rem }
    .tg-platform-btn .pd { font-size:.6875rem; color:var(--muted); margin-top:2px }
    .tg-mono-label { font-family:'JetBrains Mono',monospace; font-size:.6875rem; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; margin-bottom:.4rem }
    .tg-preview-row { display:flex; gap:.5rem; font-family:'JetBrains Mono',monospace; font-size:.75rem; color:color-mix(in srgb, var(--ink) 80%, transparent); overflow-x:auto }
    .tg-preview-row span:nth-child(odd) { color:var(--muted); white-space:nowrap }
    .tg-preview-row span:nth-child(even) { color:var(--accent); white-space:nowrap }
    .tg-btn-row { display:flex; gap:.6rem; margin-top:1rem }
  `;
  document.head.appendChild(style);
}

// ─── Main Component ──────────────────────────────────────

export default function SubdomainBuilder() {
  const { isSignedIn, profile, signInWithGoogle, signInWithGitHub, refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [subdomain, setSubdomain] = useState('');
  const [domain, setDomain] = useState('myanmardev.com');
  const [domains, setDomains] = useState<string[]>(['myanmardev.com']);
  const [platform, setPlatform] = useState<Platform>('github');
  const [sourceUrl, setSourceUrl] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showBuyTokensModal, setShowBuyTokensModal] = useState(false);

  const selectedPlatform = PLATFORMS.find((p) => p.value === platform)!;

  // Fetch available domains on mount
  useEffect(() => {
    getDomains().then((d) => {
      setDomains(d);
      if (d.length > 0 && !d.includes(domain)) setDomain(d[0]);
    });
  }, []);

  const handleCheck = useCallback(async () => {
    const trimmed = subdomain.trim().toLowerCase();
    if (!trimmed) return;
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(trimmed)) {
      setStatus('error');
      setMessage('Invalid subdomain. Use letters, numbers, and hyphens.');
      return;
    }

    // Check if user is signed in
    if (!isSignedIn) {
      setShowSignInModal(true);
      return;
    }

    // Check if user has enough tokens
    if (!profile || profile.tokenBalance < TOKEN_COST) {
      setShowBuyTokensModal(true);
      return;
    }

    setStatus('checking');
    setMessage(`Checking ${trimmed}.${domain}...`);
    try {
      const result = await checkSubdomain(trimmed, domain);
      if (result.available) {
        setStatus('available');
        setMessage(`${trimmed}.${domain} is available`);
        setStep(2);
      } else {
        setStatus('unavailable');
        setMessage(`${trimmed}.${domain} is already taken.`);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Check failed. Try again.');
    }
  }, [subdomain, domain, isSignedIn, profile]);

  const handleCreate = useCallback(async () => {
    // Double-check auth and tokens
    if (!isSignedIn || !profile) {
      setShowSignInModal(true);
      return;
    }

    if (profile.tokenBalance < TOKEN_COST) {
      setShowBuyTokensModal(true);
      return;
    }

    setStatus('creating');
    setMessage('Creating DNS record...');
    try {
      // 1. Create the subdomain
      const result = await createSubdomain({
        subdomain: subdomain.trim().toLowerCase(),
        domain,
        platform,
        sourceUrl: sourceUrl.trim(),
      });

      // 2. Deduct tokens
      const deducted = await deductTokens(profile.uid, TOKEN_COST);
      if (!deducted) {
        throw new Error('Insufficient tokens. Please purchase more tokens.');
      }

      // 3. Record the order
      await createProductOrder(
        profile.uid,
        profile.email,
        'subdomain',
        TOKEN_COST,
        {
          subdomain: `${subdomain.trim().toLowerCase()}.${domain}`,
          domain,
          platform,
          sourceUrl: sourceUrl.trim(),
        }
      );

      // 4. Refresh profile to update token balance
      await refreshProfile();

      setStatus('success');
      setMessage(`${result.subdomain} → ${result.record.content}`);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Creation failed. Try again.');
    }
  }, [subdomain, platform, sourceUrl, isSignedIn, profile, refreshProfile]);

  const handleReset = useCallback(() => {
    setStep(1); setSubdomain(''); setPlatform('github');
    setSourceUrl(''); setStatus('idle'); setMessage('');
  }, []);

  const cnamePreview = (() => {
    if (platform === 'github') return `${sourceUrl.trim() || 'username'}.github.io`;
    if (platform === 'vercel') return 'cname.vercel-dns.com';
    if (platform === 'netlify') return `${sourceUrl.trim() || 'site-name'}.netlify.app`;
    return sourceUrl.trim() || 'your-target.example.com';
  })();

  return (
    <div>
      <StepIndicator step={step} />

      {/* Step 1 */}
      {step === 1 && (
        <div>
          <label className="tg-label">Choose your domain</label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="tg-input"
            style={{ marginBottom: '0.75rem', cursor: 'pointer' }}
          >
            {domains.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <label className="tg-label">Enter your subdomain</label>
          <div className="tg-input-group">
            <input
              type="text"
              value={subdomain}
              onChange={(e) => { setSubdomain(e.target.value); if (status !== 'idle') { setStatus('idle'); setMessage(''); } }}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              placeholder="myapp"
              className="tg-input"
            />
            <span className="tg-input-suffix">.{domain}</span>
          </div>

          {/* Token Cost Info */}
          <div style={{
            marginTop: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--mono)',
            fontSize: '0.75rem',
          }}>
            <span style={{ color: 'var(--muted)' }}>Cost per subdomain:</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>🪙 {TOKEN_COST} Token</span>
          </div>

          {/* Auth Status */}
          {isSignedIn && profile ? (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'var(--wash)',
              border: '1px solid #1D232B',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--mono)',
              fontSize: '0.75rem',
            }}>
              <span style={{ color: 'var(--muted)' }}>Your balance:</span>
              <span style={{
                color: profile.tokenBalance >= TOKEN_COST ? 'var(--accent)' : '#E8A33D',
                fontWeight: 700,
              }}>
                🪙 {profile.tokenBalance} Tokens
              </span>
            </div>
          ) : (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'color-mix(in srgb, #E8A33D 8%, transparent)',
              border: '1px solid color-mix(in srgb, #E8A33D 20%, transparent)',
              borderRadius: '6px',
              fontFamily: 'var(--mono)',
              fontSize: '0.75rem',
              color: '#E8A33D',
              textAlign: 'center',
            }}>
              Sign in to check availability and deploy
            </div>
          )}

          <div style={{ marginTop: '0.9rem' }}>
            <button
              onClick={handleCheck}
              disabled={status === 'checking' || !subdomain.trim()}
              className="btn"
              style={{ width: '100%', justifyContent: 'center', opacity: (status === 'checking' || !subdomain.trim()) ? 0.5 : 1 }}
            >
              {status === 'checking' ? (
                <>
                  <svg style={{ width: '14px', height: '14px', animation: 'tgSpin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" opacity="0.75" />
                  </svg>
                  CHECKING
                </>
              ) : isSignedIn ? 'CHECK AVAILABILITY' : 'SIGN IN TO CHECK'}
            </button>
          </div>
          <StatusAlert status={status} message={message} />
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div>
          <label className="tg-label">Choose your hosting platform</label>
          <div className="tg-platform-grid">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={`tg-platform-btn${platform === p.value ? ' active' : ''}`}
              >
                <div className="pl">{p.label}</div>
                <div className="pd">{p.description}</div>
              </button>
            ))}
          </div>
          {platform === 'custom' && (
            <div style={{ padding: '0.6rem 0.8rem', borderRadius: '4px', background: 'color-mix(in srgb, #E8A33D 10%, transparent)', border: '1px solid color-mix(in srgb, #E8A33D 30%, transparent)', fontFamily: 'var(--mono)', fontSize: '0.6875rem', color: '#E8A33D', marginBottom: '0.75rem' }}>
              Custom mode: enter the full CNAME target in the next step.
            </div>
          )}
          <div className="tg-btn-row">
            <button onClick={() => setStep(1)} className="btn btn--ghost" style={{ padding: '0.6rem 1.1rem' }}>
              ← Back
            </button>
            <button onClick={() => setStep(3)} className="btn" style={{ flex: 1, justifyContent: 'center' }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div>
          <label className="tg-label">
            {platform === 'github' ? 'GitHub Username' : platform === 'vercel' ? 'Vercel Project' : platform === 'netlify' ? 'Netlify Site Name' : 'CNAME Target'}
          </label>
          <input
            type="text"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder={selectedPlatform.placeholder}
            className="tg-input"
            autoFocus
          />

          {/* DNS Preview */}
          <div style={{ marginTop: '1rem', padding: '0.9rem 1rem', borderRadius: '6px', border: '1px solid #1D232B', background: '#0D1117' }}>
            <div className="tg-mono-label">DNS Preview</div>
            <div className="tg-preview-row" style={{ gap: '1.2rem' }}>
              <span>TYPE</span><span>CNAME</span>
              <span>NAME</span><span>{subdomain}.{domain}</span>
              <span>TARGET</span><span>{cnamePreview}</span>
            </div>
          </div>

          {/* Token Cost Summary */}
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
            borderRadius: '6px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--mono)',
              fontSize: '0.8125rem',
              marginBottom: '0.5rem',
            }}>
              <span style={{ color: 'var(--muted)' }}>Token Cost:</span>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>🪙 {TOKEN_COST} Token</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--mono)',
              fontSize: '0.8125rem',
            }}>
              <span style={{ color: 'var(--muted)' }}>Your Balance:</span>
              <span style={{
                color: profile && profile.tokenBalance >= TOKEN_COST ? 'var(--accent)' : '#E8A33D',
                fontWeight: 700,
              }}>
                🪙 {profile?.tokenBalance || 0} Tokens
              </span>
            </div>
          </div>

          <div className="tg-btn-row">
            <button onClick={() => setStep(2)} disabled={status === 'creating'} className="btn btn--ghost" style={{ padding: '0.6rem 1.1rem', opacity: status === 'creating' ? 0.5 : 1 }}>
              ← Back
            </button>
            <button
              onClick={handleCreate}
              disabled={status === 'creating' || !sourceUrl.trim()}
              className="btn"
              style={{ flex: 1, justifyContent: 'center', opacity: (status === 'creating' || !sourceUrl.trim()) ? 0.5 : 1 }}
            >
              {status === 'creating' ? (
                <>
                  <svg style={{ width: '14px', height: '14px', animation: 'tgSpin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" opacity="0.75" />
                  </svg>
                  DEPLOYING
                </>
              ) : `DEPLOY SUBDOMAIN (🪙 ${TOKEN_COST} Token)`}
            </button>
          </div>

          <StatusAlert status={status} message={message} />

          {status === 'success' && (
            <button onClick={handleReset} className="btn btn--ghost" style={{ marginTop: '0.9rem', width: '100%', justifyContent: 'center' }}>
              Create Another Subdomain
            </button>
          )}
        </div>
      )}

      {/* Sign In Modal */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSignInGoogle={async () => {
          setShowSignInModal(false);
          await signInWithGoogle();
        }}
        onSignInGitHub={async () => {
          setShowSignInModal(false);
          await signInWithGitHub();
        }}
      />

      {/* Buy Tokens Modal */}
      <BuyTokensModal
        isOpen={showBuyTokensModal}
        onClose={() => setShowBuyTokensModal(false)}
        onSuccess={refreshProfile}
      />
    </div>
  );
}
