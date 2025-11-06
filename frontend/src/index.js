import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Aplicacion from './App';
import reportWebVitals from './reportWebVitals';
import 'leaflet/dist/leaflet.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Aplicacion />
  </React.StrictMode>
);


reportWebVitals();
