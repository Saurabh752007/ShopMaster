
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// We only clear data if the app version changes or a specific reset flag is found.
// For the purpose of this request, we ensure the 'isLoggedIn' state in App controls access.
// If no user profile exists, we treat it as a fresh install.

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
