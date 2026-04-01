const FIREBASE_APP_SCRIPT = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js';
const FIREBASE_AUTH_SCRIPT = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js';
const FIREBASE_DATABASE_SCRIPT = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyD_FC7uZuAG_8tsqR5mc_UtvfAzykQ-AHA',
  authDomain: 'valorant-team-finder.firebaseapp.com',
  databaseURL: 'https://valorant-team-finder-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'valorant-team-finder',
  storageBucket: 'valorant-team-finder.firebasestorage.app',
  messagingSenderId: '328720060809',
  appId: '1:328720060809:web:fdb177eefe544fd2db9158',
  measurementId: 'G-JM5ZYMW0KN',
};

let firebaseBootstrapPromise;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true }
    );
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

export function hasFirebaseConfig() {
  return true;
}

function getFriendlyAuthError(error) {
  const code = error?.code || '';

  if (code === 'auth/operation-not-allowed') {
    return 'ENABLE FIREBASE AUTH METHOD';
  }

  if (code === 'auth/network-request-failed') {
    return 'AUTH NETWORK ERROR';
  }

  if (code === 'auth/api-key-not-valid') {
    return 'FIREBASE API KEY ERROR';
  }

  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'WRONG EMAIL OR PASSWORD';
  }

  if (code === 'auth/user-not-found') {
    return 'ADMIN USER NOT FOUND';
  }

  if (code === 'auth/invalid-email') {
    return 'INVALID EMAIL FORMAT';
  }

  return 'AUTH FAILED, REFRESH PAGE';
}

function ensureFirebaseApp() {
  if (firebaseBootstrapPromise) {
    return firebaseBootstrapPromise;
  }

  firebaseBootstrapPromise = loadScript(FIREBASE_APP_SCRIPT)
    .then(() => loadScript(FIREBASE_AUTH_SCRIPT))
    .then(() => loadScript(FIREBASE_DATABASE_SCRIPT))
    .then(() => {
      const firebase = window.firebase;
      if (!firebase) {
        throw new Error('FIREBASE SDK MISSING');
      }

      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      return {
        firebase,
        auth: firebase.auth(),
        database: firebase.database(),
      };
    })
    .catch((error) => ({ firebase: null, auth: null, database: null, error: error?.message || 'AUTH FAILED, REFRESH PAGE' }));

  return firebaseBootstrapPromise;
}

function waitForCurrentUser(auth, timeoutMs = 5000) {
  return new Promise((resolve) => {
    let settled = false;
    let unsubscribe = () => {};

    const finish = (payload) => {
      if (settled) {
        return;
      }

      settled = true;
      unsubscribe();
      resolve(payload);
    };

    unsubscribe = auth.onAuthStateChanged((user) => {
      finish(user || null);
    });

    window.setTimeout(() => finish(auth.currentUser || null), timeoutMs);
  });
}

async function ensureAnonymousAuth(auth) {
  if (auth.currentUser?.uid) {
    return auth.currentUser;
  }

  try {
    await auth.signInAnonymously();
  } catch (error) {
    throw new Error(getFriendlyAuthError(error));
  }

  const user = await waitForCurrentUser(auth);
  if (!user?.uid) {
    throw new Error('AUTH TIMED OUT');
  }

  return user;
}

export function bootstrapFirebaseServices() {
  return ensureFirebaseApp().then(async (services) => {
    if (!services?.auth || !services?.database) {
      return { firebase: null, auth: null, database: null, uid: '', error: services?.error || 'AUTH FAILED, REFRESH PAGE' };
    }

    try {
      const user = await ensureAnonymousAuth(services.auth);
      return { ...services, uid: user?.uid || '', error: '' };
    } catch (error) {
      return { ...services, uid: '', error: error?.message || 'AUTH FAILED, REFRESH PAGE' };
    }
  });
}

export function bootstrapFirebaseAuth() {
  return ensureFirebaseApp().then(async (services) => {
    if (!services?.auth) {
      return { ready: true, uid: '', email: '', isAnonymous: true, error: services?.error || 'AUTH FAILED, REFRESH PAGE' };
    }

    const user = services.auth.currentUser || (await waitForCurrentUser(services.auth, 2500));
    return {
      ready: true,
      uid: user?.uid || '',
      email: user?.email || '',
      isAnonymous: user ? Boolean(user.isAnonymous) : true,
      error: '',
    };
  });
}

export function signInFirebaseAdmin(email, password) {
  return ensureFirebaseApp().then(async (services) => {
    if (!services?.auth) {
      return { ok: false, uid: '', email: '', error: services?.error || 'AUTH FAILED, REFRESH PAGE' };
    }

    try {
      const result = await services.auth.signInWithEmailAndPassword(email, password);
      return {
        ok: true,
        uid: result?.user?.uid || services.auth.currentUser?.uid || '',
        email: result?.user?.email || services.auth.currentUser?.email || '',
        error: '',
      };
    } catch (error) {
      return {
        ok: false,
        uid: '',
        email: '',
        error: getFriendlyAuthError(error),
      };
    }
  });
}

export function signOutFirebaseAdmin() {
  return ensureFirebaseApp().then(async (services) => {
    if (!services?.auth) {
      return;
    }

    try {
      await services.auth.signOut();
      await ensureAnonymousAuth(services.auth);
    } catch {
      return;
    }
  });
}
