import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventReducer from './slices/eventSlice';
import cartReducer from './slices/cartSlice';
import storage from 'redux-persist/lib/storage';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

// Cấu hình chung
const rootPersistConfig = {
  key: 'root',
  storage: storage,
  // Giờ chúng ta sẽ dùng blacklist để bỏ qua auth, vì auth đã có config riêng
  blacklist: ['auth'],
};

const authPersistConfig = {
  key: 'auth',
  storage: storage,
  // Chỉ lưu những trường này của authSlice, không lưu status hay error
  whitelist: ['user', 'token', 'isAuthenticated'],
};
const rootReducer = combineReducers({
  // Bọc authReducer bằng persistReducer với config riêng của nó
  auth: persistReducer(authPersistConfig, authReducer),
  event: eventReducer, // eventReducer sẽ được quản lý bởi rootPersistConfig
  cart: cartReducer,
});

// Bọc rootReducer bằng rootPersistConfig
const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  // KHÔNG CẦN preloadedState nữa, redux-persist sẽ lo việc này
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }), // KHÔNG CẦN concat middleware localStorage nữa
  devTools: false,
});

export const persistor = persistStore(store);
