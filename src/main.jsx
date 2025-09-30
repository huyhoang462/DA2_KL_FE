import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { store } from './store/store.js';
import { Web3Provider } from './contexts/Web3Provider.jsx';
import { Provider } from 'react-redux';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <Web3Provider>
        <App />
      </Web3Provider>
    </Provider>
  </StrictMode>
);
