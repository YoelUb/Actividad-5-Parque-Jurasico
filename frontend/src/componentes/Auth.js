import React, { useState } from 'react';
import './Auth.css';

const API_URL = 'http://localhost:8000/api';

function Autenticacion({ enLoginExitoso }) {
  const [usuario, setUsuario] = useState('visitante1');
  const [contrasena, setContrasena] = useState('pass123');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', usuario);
      formData.append('password', contrasena);

      const respuesta = await fetch(`${API_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      if (!respuesta.ok) {
        const errData = await respuesta.json();
        throw new Error(errData.detail || 'Error al iniciar sesión');
      }
      const data = await respuesta.json();
      enLoginExitoso(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Iniciar Sesión</h2>
      <p>(Prueba con: <strong>visitante1</strong> / <strong>pass123</strong>)</p>
      <form onSubmit={manejarSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={cargando}>
          {cargando ? 'Cargando...' : 'Entrar al Parque'}
        </button>
      </form>
    </div>
  );
}

export default Autenticacion;