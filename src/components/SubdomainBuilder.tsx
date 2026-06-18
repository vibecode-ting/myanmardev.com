import React, { useState, useCallback } from 'react';
import { checkSubdomain, createSubdomain } from '../lib/api';

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
  {
    value: 'github',
    label: 'GitHub Pages',
    description: 'Host your site on GitHub Pages',
    cnameTarget: '.github.io',
    placeholder: 'your-username',
  },
  {
    value: 'vercel',
    label: 'Vercel',
    description: 'Deploy with Vercel',
    cnameTarget: 'cname.vercel-dns.com',
    placeholder: 'your-project',
  },
  {
    value: 'netlify',
    label: 'Netlify',
    description: 'Deploy on Netlify',
    cnameTarget: 'netlify.app',
    placeholder: 'your-site-name',
  },
  {
    value: 'custom',
    label: 'Custom CNAME',
    description: 'Enter any CNAME target',
    cnameTarget: '',
    placeholder: 'your-target.example.com',
  },
];

// ─── Step Indicator ─────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { num: 1, label: 'Subdomain' },
    { num: 2, label: 'Platform' },
    { num: 3, label: 'Source' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
      {steps.map((s, i) => (
        <React.Fragment key={s.num}>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step === s.num
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 scale-110'
                  : step > s.num
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span
              className={`hidden sm:inline text-xs font-medium ${
                step === s.num ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 sm:w-12 h-0.5 rounded transition-colors duration-300 ${
                step > s.num ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
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

  return (
    <div
      className={`mt-4 p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
        isSuccess
          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
          : isError
            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
      }`}
    >
      {isLoading && (
        <svg className="w-5 h-5 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {isSuccess && <span className="text-xl flex-shrink-0">✅</span>}
      {isError && <span className="text-xl flex-shrink-0">❌</span>}
      <div>
        <p className="text-sm font-medium">{message}</p>
        {status === 'success' && (
          <p className="text-xs mt-1 opacity-75">
            DNS propagation may take a few minutes. Your subdomain will be live shortly.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────

export default function SubdomainBuilder() {
  const [step, setStep] = useState<Step>(1);
  const [subdomain, setSubdomain] = useState('');
  const [platform, setPlatform] = useState<Platform>('github');
  const [sourceUrl, setSourceUrl] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const selectedPlatform = PLATFORMS.find((p) => p.value === platform)!;

  // ── Step 1: Check availability ───────────────────────
  const handleCheck = useCallback(async () => {
    const trimmed = subdomain.trim().toLowerCase();
    if (!trimmed) return;

    // Validate subdomain format
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(trimmed)) {
      setStatus('error');
      setMessage('Invalid subdomain. Use only letters, numbers, and hyphens.');
      return;
    }

    setStatus('checking');
    setMessage(`Checking ${trimmed}.myanmardev.com...`);

    try {
      const result = await checkSubdomain(trimmed);

      if (result.available) {
        setStatus('available');
        setMessage(`✅ ${trimmed}.myanmardev.com is available!`);
        setStep(2);
      } else {
        setStatus('unavailable');
        setMessage(`❌ ${trimmed}.myanmardev.com is already taken. Try another name.`);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to check subdomain. Please try again.');
    }
  }, [subdomain]);

  // ── Step 3: Create DNS record ────────────────────────
  const handleCreate = useCallback(async () => {
    setStatus('creating');
    setMessage('Creating DNS record...');

    try {
      const result = await createSubdomain({
        subdomain: subdomain.trim().toLowerCase(),
        platform,
        sourceUrl: sourceUrl.trim(),
      });

      setStatus('success');
      setMessage(`🎉 ${result.subdomain} has been created and points to ${result.record.content}`);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to create subdomain. Please try again.');
    }
  }, [subdomain, platform, sourceUrl]);

  // ── Reset ────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setStep(1);
    setSubdomain('');
    setPlatform('github');
    setSourceUrl('');
    setStatus('idle');
    setMessage('');
  }, []);

  // Determine CNAME preview
  const cnamePreview = (() => {
    if (platform === 'github') {
      return `${sourceUrl.trim() || 'username'}.github.io`;
    }
    if (platform === 'vercel') {
      return 'cname.vercel-dns.com';
    }
    if (platform === 'netlify') {
      return `${sourceUrl.trim() || 'site-name'}.netlify.app`;
    }
    return sourceUrl.trim() || 'your-target.example.com';
  })();

  return (
    <div>
      <StepIndicator step={step} />

      {/* Step 1: Subdomain input */}
      {step === 1 && (
        <div className="animate-fade-in">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Enter your subdomain
          </label>
          <div className="flex items-stretch gap-0 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
            <input
              type="text"
              value={subdomain}
              onChange={(e) => {
                setSubdomain(e.target.value);
                if (status !== 'idle') {
                  setStatus('idle');
                  setMessage('');
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              placeholder="myapp"
              className="flex-1 px-4 py-3 bg-white dark:bg-[#0a0a0b] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none text-lg"
              autoFocus
            />
            <span className="inline-flex items-center px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-lg font-medium border-l border-slate-300 dark:border-slate-600">
              .myanmardev.com
            </span>
          </div>

          <button
            onClick={handleCheck}
            disabled={status === 'checking' || !subdomain.trim()}
            className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-2"
          >
            {status === 'checking' ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Checking...
              </>
            ) : (
              'Check Availability'
            )}
          </button>

          <StatusAlert status={status} message={message} />
        </div>
      )}

      {/* Step 2: Choose platform */}
      {step === 2 && (
        <div className="animate-fade-in">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
            Choose your hosting platform
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                  platform === p.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20 ring-2 ring-purple-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-[#0a0a0b]'
                }`}
              >
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{p.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.description}</p>
              </button>
            ))}
          </div>

          {platform === 'custom' && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
              Custom mode: you will enter the full CNAME target in the next step.
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-sm font-medium"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] transition-all duration-300"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Source URL + Create */}
      {step === 3 && (
        <div className="animate-fade-in">
          {/* Source URL input */}
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            {platform === 'github'
              ? 'GitHub Username'
              : platform === 'vercel'
                ? 'Vercel Project'
                : platform === 'netlify'
                  ? 'Netlify Site Name'
                  : 'CNAME Target'}
          </label>
          <input
            type="text"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder={selectedPlatform.placeholder}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-[#0a0a0b] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            autoFocus
          />

          {/* DNS Preview */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              DNS Record Preview
            </p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-slate-400 dark:text-slate-500">Type</span>
                <p className="font-mono text-slate-900 dark:text-white font-semibold">CNAME</p>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500">Name</span>
                <p className="font-mono text-slate-900 dark:text-white font-semibold break-all">
                  {subdomain}.myanmardev.com
                </p>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500">Target</span>
                <p className="font-mono text-slate-900 dark:text-white font-semibold break-all">{cnamePreview}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setStep(2)}
              disabled={status === 'creating'}
              className="px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-sm font-medium disabled:opacity-50"
            >
              ← Back
            </button>
            <button
              onClick={handleCreate}
              disabled={status === 'creating' || !sourceUrl.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {status === 'creating' ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Subdomain'
              )}
            </button>
          </div>

          <StatusAlert status={status} message={message} />

          {/* Success — offer to create another */}
          {status === 'success' && (
            <button
              onClick={handleReset}
              className="mt-4 w-full px-6 py-2.5 border-2 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-semibold rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
            >
              Create Another Subdomain
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Animation (client-side only) ─────────────────────

// Inject the fade-in animation keyframes into the document.
// Guarded for SSR — runs only in the browser.
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
}
