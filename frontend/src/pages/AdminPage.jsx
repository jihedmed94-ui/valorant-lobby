import { useEffect, useState } from 'react';
import AdminGate from '../components/admin/AdminGate';
import AdminPanel from '../components/admin/AdminPanel';
import { bootstrapFirebaseAuth, hasFirebaseConfig, signInFirebaseAdmin, signOutFirebaseAdmin } from '../lib/firebase';

const ADMIN_SESSION_KEY = 'valorant-admin-session-expires-at';
const ADMIN_SESSION_TTL_MS = 15 * 60 * 1000;

function hasValidAdminSession() {
  try {
    return Number(sessionStorage.getItem(ADMIN_SESSION_KEY)) > Date.now();
  } catch {
    return false;
  }
}

function refreshAdminSession() {
  try {
    sessionStorage.setItem(ADMIN_SESSION_KEY, String(Date.now() + ADMIN_SESSION_TTL_MS));
  } catch {
    return;
  }
}

function clearAdminSession() {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    return;
  }
}

export default function AdminPage({ state, setState }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isUnlocked, setUnlocked] = useState(() => hasValidAdminSession());
  const [hasError, setHasError] = useState(false);
  const [authState, setAuthState] = useState({ ready: false, uid: '', email: '', isAnonymous: true, error: '' });

  useEffect(() => {
    let isMounted = true;

    bootstrapFirebaseAuth().then((result) => {
      if (!isMounted) {
        return;
      }

      setAuthState({
        ready: true,
        uid: result?.uid || '',
        email: result?.email || '',
        isAnonymous: result?.isAnonymous ?? true,
        error: result?.error || '',
      });

      if (hasValidAdminSession() && result?.uid && !result?.isAnonymous) {
        setUnlocked(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isUnlocked) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      if (!hasValidAdminSession()) {
        setUnlocked(false);
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [isUnlocked]);

  const handleUnlock = async () => {
    if (!credentials.email.trim() || !credentials.password.trim()) {
      setHasError(true);
      return;
    }

    const result = await signInFirebaseAdmin(credentials.email.trim(), credentials.password);
    const canUnlock = Boolean(result?.ok && result?.uid);

    setUnlocked(canUnlock);
    setHasError(!canUnlock);
    setAuthState({
      ready: true,
      uid: result?.uid || '',
      email: result?.email || '',
      isAnonymous: !canUnlock,
      error: result?.error || '',
    });

    if (canUnlock) {
      refreshAdminSession();
    }
  };

  const handleLock = async () => {
    clearAdminSession();
    setUnlocked(false);
    await signOutFirebaseAdmin();
    const result = await bootstrapFirebaseAuth();
    setAuthState({
      ready: true,
      uid: result?.uid || '',
      email: result?.email || '',
      isAnonymous: result?.isAnonymous ?? true,
      error: result?.error || '',
    });
  };

  const authMessage = !authState.ready
    ? 'AUTHENTICATING FIREBASE...'
    : authState.error
      ? authState.error
      : hasFirebaseConfig()
        ? authState.isAnonymous
          ? 'FIREBASE READY, SIGN IN WITH ADMIN EMAIL'
          : `SIGNED IN: ${authState.email || 'ADMIN'}`
        : 'FIREBASE ENV NOT SET YET';

  return (
    <main className="admin-main">
      {!isUnlocked ? (
        <AdminGate
          credentials={credentials}
          onChange={(event) => {
            const { name, value } = event.target;
            setCredentials((current) => ({ ...current, [name]: value }));
            setHasError(false);
          }}
          onUnlock={handleUnlock}
          error={hasError}
          authMessage={authMessage}
        />
      ) : (
        <AdminPanel state={state} setState={setState} onLock={handleLock} />
      )}
    </main>
  );
}
