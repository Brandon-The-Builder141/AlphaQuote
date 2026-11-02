import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { installApiAuthInterceptor } from './services/apiAuthInterceptor';

// Attach the Clerk session token to API requests (Pass Two lockdown)
installApiAuthInterceptor();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
