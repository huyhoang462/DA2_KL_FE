import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { authLocalStorageMiddleware } from './middlewares/localStorageMiddleware';

const loadAuthFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('shineticket');
    if (serializedState === null) {
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        status: 'idle',
        error: null,
      };
    }
    const parsedState = JSON.parse(serializedState);
    return parsedState.auth;
  } catch (err) {
    console.error('Could not load auth state from localStorage', err);

    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: loadAuthFromLocalStorage(),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([authLocalStorageMiddleware]),
});
