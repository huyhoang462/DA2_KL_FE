import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { store } from './store/store.js';
import { Web3Provider } from './contexts/Web3Provider.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';

const queryClient = new QueryClient();
createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <App />
      </Web3Provider>
    </QueryClientProvider>
  </Provider>
  //</StrictMode>
);
