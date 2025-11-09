import React, { useState } from 'react';
import './Auth.css';

const API_URL = 'http://localhost:8000/api';

function Autenticacion({ enLoginExitoso, onNavigateToRegister, onForceChangePassword }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
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

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.detail || 'Error al iniciar sesión');
      }

      if (data.must_change_password) {
        onForceChangePassword(data.access_token);
      } else {
        enLoginExitoso(data.access_token);
      }
      // -----------------------------

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={manejarSubmit}>
        <input
          type="text"
          placeholder="Usuario (email)"
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
        <button type-"submit" disabled={cargando}>
          {cargando ? 'Cargando...' : 'Entrar al Parque'}
        </button>
      </form>

      <div className="auth-switch">
        <p>
            ¿No tienes cuenta?{' '}
            <button onClick={onNavigateToRegister} className="link-button">
                Regístrate aquí
            </button>
        </p>
      </div>
    </div>
  );
}

export default Autenticacion;