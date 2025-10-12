const STORAGE_KEY = 'shineticket';

export function getDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export const authLocalStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === 'auth/login') {
    const state = store.getState();
    const db = getDB();
    db.auth = {
      user: state.auth.user,
      token: state.auth.token,
      isAuthenticated: true,
    };
    saveDB(db);
  }
  if (action.type === 'auth/setUser') {
    const state = store.getState();
    const db = getDB();
    db.auth.user = state.auth.user;
    saveDB(db);
  }
  if (action.type === 'auth/logout') {
    const db = getDB();
    db.auth = {
      user: null,
      token: null,
      isAuthenticated: false,
    };
    saveDB(db);
  }

  return result;
};
