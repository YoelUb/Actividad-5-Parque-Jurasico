import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const API_URL = 'http://localhost:8000/api/admin';

function AdminDashboard({ token }) {
  const [logs, setLogs] = useState('');
  const [dinos, setDinos] = useState([]);
  const [recintos, setRecintos] = useState([]);
  const [error, setError] = useState('');

  const fetchData = async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al cargar datos');
      }
      return response;
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchLogs = async () => {
    const response = await fetchData('logs');
    if (response) {
      const text = await response.text();
      setLogs(text);
    }
  };

  const fetchDinos = async () => {
    const response = await fetchData('dinosaurios');
    if (response) {
      const data = await response.json();
      setDinos(data);
    }
  };

  const fetchRecintos = async () => {
    const response = await fetchData('recintos');
    if (response) {
      const data = await response.json();
      setRecintos(data);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchDinos();
    fetchRecintos();
  }, [token]);

  return (
    <div className="admin-dashboard">
      <h1>Panel de Administrador</h1>
      {error && <p className="error">{error}</p>}

      <div className="admin-section">
        <h2>Dinosaurios Creados ({dinos.length})</h2>
        <ul>
          {dinos.map(dino => (
            <li key={dino.id}><strong>{dino.nombre}</strong> ({dino.tipo_recinto}) - {dino.dieta}</li>
          ))}
        </ul>
      </div>

      <div className="admin-section">
        <h2>Recintos del Parque ({recintos.length})</h2>
        <ul>
          {recintos.map(r => (
            <li key={r.grid_id}><strong>{r.nombre}</strong> ({r.tipo}) - {r.id_dinosaurio || 'Vacío'}</li>
          ))}
        </ul>
      </div>

      <div className="admin-section">
        <h2>Logs de Auditoría</h2>
        <button onClick={fetchLogs} className="refresh-button">Refrescar Logs</button>
        <pre className="logs-container">
          {logs || 'Cargando logs...'}
        </pre>
      </div>
    </div>
  );
}

export default AdminDashboard;