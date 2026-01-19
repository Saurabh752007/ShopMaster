
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Fresh Setup: Clear all existing persistent data to ensure a clean slate for the new environment.
const APP_STORAGE_KEYS = [
  'sm_products',
  'sm_bills',
  'sm_customers',
  'sm_data_updated',
  'shopmaster-user-profile',
  'user-avatar'
];

APP_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
