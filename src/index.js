import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Wrap it in strict mode so that
// React will warn us about any potential issues
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
