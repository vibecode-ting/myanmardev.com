import React, { useState, useEffect, useCallback } from 'react';
import { t, type Language } from '../i18n/utils';

interface Props {
  lang: Language;
}

const styles = {
  loading: { fontSize: '.75rem', color: 'var(--muted)', fontFamily: 'var(--mono)' },
  userName: { fontSize: '.6875rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px', fontFamily: 'var(--mono)' },
  container: { display: 'flex', alignItems: 'center', gap: '.6rem' },
};

export default function AuthButton({ lang }: Props) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    (async () => {
      try {
        const fb = await import('../lib/firebase');
        const authMod = await import('firebase/auth');

        const auth = fb.getAuthInstance();
        if (!auth) { setLoading(false); return; }

        unsub = authMod.onAuthStateChanged(auth, (u: any) => {
          setUser(u);
          setLoading(false);
        });
      } catch (e) {
        console.warn('Firebase auth not configured:', e);
        setLoading(false);
      }
    })();

    return () => { if (unsub) unsub(); };
  }, []);

  const handleSignIn = useCallback(async () => {
    try {
      const fb = await import('../lib/firebase');
      const authMod = await import('firebase/auth');
      const auth = fb.getAuthInstance();
      if (!auth) return;
      const provider = new authMod.GoogleAuthProvider();
      await authMod.signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      const fb = await import('../lib/firebase');
      const authMod = await import('firebase/auth');
      const auth = fb.getAuthInstance();
      if (!auth) return;
      await authMod.signOut(auth);
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  }, []);

  if (loading) {
    return <span style={styles.loading}>...</span>;
  }

  if (user) {
    return (
      <div style={styles.container}>
        <span style={styles.userName}>
          {user.displayName || user.email}
        </span>
        <button onClick={handleSignOut} className="btn btn--ghost" style={{ padding: '.35rem .8rem', fontSize: '.6875rem' }}>
          {t(lang, 'auth.signOut')}
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleSignIn} className="btn" style={{ padding: '.4rem .9rem', fontSize: '.6875rem' }}>
      {t(lang, 'auth.signIn')}
    </button>
  );
}
