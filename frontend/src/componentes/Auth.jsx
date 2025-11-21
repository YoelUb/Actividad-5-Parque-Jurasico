import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import './Registro.css';

const API_URL = 'http://localhost:8000/api';

function Autenticacion({ enLoginExitoso }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const EyeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeOffIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  const LoadingSpinner = (
    <svg className="loading-spinner" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <style>
        {`
          .spinner_aj0A{transform-origin:center;animation:spinner_KYSC .75s infinite linear}@keyframes spinner_KYSC{100%{transform:rotate(360deg)}}
        `}
      </style>
      <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
      <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" className="spinner_aj0A"/>
    </svg>
  );

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
        navigate('/force-change-password', { state: { token: data.access_token } });
      } else {
        enLoginExitoso(data.access_token);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="auth-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7C21 5.9 20.1 5 19 5C17.9 5 17 5.9 17 7V9C15.9 9 15 9.9 15 11V16C15 17.1 15.9 18 17 18H19C20.1 18 21 17.1 21 16V11C21 9.9 20.1 9 19 9ZM19 7V9H17V7H19ZM7 9V7C7 5.9 6.1 5 5 5C3.9 5 3 5.9 3 7V9C1.9 9 1 9.9 1 11V16C1 17.1 1.9 18 3 18H5C6.1 18 7 17.1 7 16V11C7 9.9 6.1 9 5 9ZM5 7V9H3V7H5ZM12 8C14.2 8 16 9.8 16 12V18C16 19.1 15.1 20 14 20H10C8.9 20 8 19.1 8 18V12C8 9.8 9.8 8 12 8Z"/>
          </svg>
        </div>
        <h2>Iniciar Sesión</h2>
        <p>Accede a tu cuenta para continuar la aventura</p>
      </div>

      <form onSubmit={manejarSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="usuario" className="sr-only">Usuario (email)</label>
          <input
            id="usuario"
            type="text"
            placeholder="Usuario (email)"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            disabled={cargando}
          />
        </div>

        <div className="form-group">
          <label htmlFor="contrasena" className="sr-only">Contraseña</label>
          <div className="password-wrapper">
            <input
              id="contrasena"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              disabled={cargando}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              disabled={cargando}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? EyeOffIcon : EyeIcon}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="submit-button"
        >
          {cargando ? (
            <>
              {LoadingSpinner}
              Iniciando sesión...
            </>
          ) : (
            'Entrar al Parque'
          )}
        </button>
      </form>

      <div className="auth-links">
        <Link to="/solicitar-reset" className="auth-link">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <div className="auth-switch">
        <p>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="auth-link accent">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Autenticacion;