import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import axios from 'axios';
import 'antd/dist/reset.css';

// Configure API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_URL;

// Add ngrok header to bypass warning page
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

console.log('🌐 API URL:', API_URL);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
