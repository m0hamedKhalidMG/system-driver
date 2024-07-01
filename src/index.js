import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { DriverProvider } from './DriverContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>

  <DriverProvider>
  <App />
</DriverProvider>

  </React.StrictMode>
);

