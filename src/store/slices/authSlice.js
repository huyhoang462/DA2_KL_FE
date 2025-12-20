import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  privyToken: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    login: (state, action) => {
      const { user, accessToken, privyToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      state.privyToken = privyToken || null;
      state.isAuthenticated = true;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.privyToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout, setUser } = authSlice.actions;

export default authSlice.reducer;
