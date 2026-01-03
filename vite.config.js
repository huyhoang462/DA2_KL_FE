import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      external: [
        '__vite-optional-peer-dep:@solana-program/system:@privy-io/react-auth:false',
      ],
    },
  },
  resolve: {
    alias: {
      '__vite-optional-peer-dep:@solana-program/system:@privy-io/react-auth:false':
        () => null,
    },
  },
});
