import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { registerServiceWorker } from './utils/pwa';
import { getCustomerAuth } from './utils/shopifyCloudSync';

// Immediately capture & lock Shopify auth credentials from URL before any routing occurs
getCustomerAuth();

// Register PWA service worker for Android WebAPK installability
registerServiceWorker();

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
