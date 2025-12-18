import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { store } from './store/store.js';
import { Web3Provider } from './contexts/Web3Provider.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';

// 1. Import PrivyProvider
import { PrivyProvider } from '@privy-io/react-auth';

const queryClient = new QueryClient();

// 2. Lấy App ID từ biến môi trường
// Nếu không tìm thấy biến môi trường, nó sẽ fallback về chuỗi rỗng (bạn nên check kỹ file .env)
const PRIVY_APP_ID = 'cmj8c0e3s00cjju0d5w34t2hm';

if (!PRIVY_APP_ID) {
  console.error('Lỗi: Chưa cấu hình VITE_PRIVY_APP_ID trong file .env');
}

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      {/* 3. Cấu hình Privy */}
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          // Vì chúng ta dùng Custom Auth (Login bằng API của bạn),
          // nên phần loginMethods này chủ yếu để cấu hình nền tảng,
          // người dùng sẽ KHÔNG thấy popup chọn Email/Google của Privy đâu.
          // loginMethods: ['email'],
          loginMethods: ['email', 'wallet', 'google', 'apple', 'custom'],
          // Tùy chỉnh giao diện (Màu sắc thương hiệu của bạn)
          appearance: {
            theme: 'light',
            accentColor: '#676FFF',
            landingHeader: 'Hệ thống Vé NFT',
            // logo: 'https://link-logo-cua-ban.png', // Thêm logo nếu muốn popup đẹp hơn (nếu lỡ hiện)
          },

          // --- QUAN TRỌNG NHẤT CHO FLOW NÀY ---
          // Dòng này đảm bảo khi bạn gọi `loginWithCustomToken` (ở LoginPage),
          // Privy sẽ tự động tạo ví ngay lập tức cho user nếu họ chưa có.
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        {/* Web3Provider nằm trong Privy để sử dụng được Smart Wallets */}
        <Web3Provider>
          <App />
        </Web3Provider>
      </PrivyProvider>
    </QueryClientProvider>
  </Provider>
  // </StrictMode>
);
