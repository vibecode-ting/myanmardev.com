import React, { useEffect, useState } from 'react';

/**
 * AuthGate — manages a data-auth attribute on <body> so CSS can
 * show/hide content based on authentication state.
 *
 * States written to <body data-auth="...">:
 *  - "loading"   → auth still initializing
 *  - "anonymous" → not signed in
 *  - "signed-in" → signed in (any provider)
 *
 * Place once at the root of client-side React with client:load.
 *
 * CSS rules (add to global styles):
 *   [data-auth="signed-in"] .auth-only { display: unset }
 *   [data-auth="signed-in"] .anon-only { display: none }
 *   body:not([data-auth="signed-in"]) .auth-only { display: none }
 *   body:not([data-auth="signed-in"]) .anon-only { display: unset }
 */
export default function AuthGate() {
  const [bodyState, setBodyState] = useState<string>('loading');

  useEffect(() => {
    let unsub: (() => void) | null = null;

    (async () => {
      try {
        const fb = await import('../lib/firebase');
        const authMod = await import('firebase/auth');

        const auth = fb.getAuthInstance();
        if (!auth) {
          setBodyState('anonymous');
          return;
        }

        unsub = authMod.onAuthStateChanged(auth, (u: any) => {
          setBodyState(u ? 'signed-in' : 'anonymous');
        });
      } catch (e) {
        console.warn('AuthGate: Firebase not configured:', e);
        setBodyState('anonymous');
      }
    })();

    return () => { if (unsub) unsub(); };
  }, []);

  // Sync state to <body> attribute
  useEffect(() => {
    document.body.setAttribute('data-auth', bodyState);
    return () => document.body.removeAttribute('data-auth');
  }, [bodyState]);

  return null; // invisible — just manages the body attribute
}
