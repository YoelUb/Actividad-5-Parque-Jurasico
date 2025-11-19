import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Auth.css';
import './Registro.css';

const API_URL = 'http://localhost:8000/api';

function ForceChangePassword() {
  const [formData, setFormData] = useState({
    new_username: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const token = location.state?.token;

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
        {`.spinner_aj0A{transform-origin:center;animation:spinner_KYSC .75s infinite linear}@keyframes spinner_KYSC{100%{transform:rotate(360deg)}}`}
      </style>
      <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
      <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" className="spinner_aj0A"/>
    </svg>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    setFieldErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setError(null);
  };

  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case 'new_username':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[name] = 'Formato de correo electrónico inválido';
        }
        break;
      case 'new_password':
        if (value.length < 8) {
          errors[name] = 'La contraseña debe tener al menos 8 caracteres';
        }
        break;
      case 'confirm_password':
        if (value !== formData.new_password) {
          errors[name] = 'Las contraseñas no coinciden';
        }
        break;
      default:
        break;
    }

    return errors[name] || '';
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const errors = {};
    errors.new_username = validateField('new_username', formData.new_username);
    errors.new_password = validateField('new_password', formData.new_password);
    errors.confirm_password = validateField('confirm_password', formData.confirm_password);

    setFieldErrors(errors);

    // Verificar si hay algún error
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      setError('Por favor, corrige los errores en el formulario');
      return;
    }

    if (!token) {
      setError('Token de autorización no encontrado. Vuelve a iniciar sesión.');
      return;
    }

    setCargando(true);
    try {
      const respuesta = await fetch(`${API_URL}/auth/force-change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_username: formData.new_username,
          new_password: formData.new_password,
        }),
      });

      if (!respuesta.ok) {
        const errData = await respuesta.json();
        throw new Error(errData.detail || 'Error al cambiar la contraseña');
      }

      alert('✅ Contraseña cambiada exitosamente. Por favor, inicia sesión de nuevo.');
      navigate('/login');

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const isSubmitDisabled = () => {
    return cargando ||
           !formData.new_username ||
           !formData.new_password ||
           !formData.confirm_password ||
           formData.new_password.length < 8;
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="auth-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7C21 5.9 20.1 5 19 5C17.9 5 17 5.9 17 7V9C15.9 9 15 9.9 15 11V16C15 17.1 15.9 18 17 18H19C20.1 18 21 17.1 21 16V11C21 9.9 20.1 9 19 9ZM19 7V9H17V7H19ZM7 9V7C7 5.9 6.1 5 5 5C3.9 5 3 5.9 3 7V9C1.9 9 1 9.9 1 11V16C1 17.1 1.9 18 3 18H5C6.1 18 7 17.1 7 16V11C7 9.9 6.1 9 5 9ZM5 7V9H3V7H5ZM12 8C14.2 8 16 9.8 16 12V18C16 19.1 15.1 20 14 20H10C8.9 20 8 19.1 8 18V12C8 9.8 9.8 8 12 8Z"/>
          </svg>
        </div>
        <h2>Actualización Requerida</h2>
        <p className="auth-subtitle">
          Por seguridad, debes actualizar tu nombre de usuario (email) y contraseña antes de continuar.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="auth-form">
        <div className="form-group">
          <label htmlFor="new_username" className="sr-only">Nuevo Correo Electrónico</label>
          <input
            id="new_username"
            type="email"
            name="new_username"
            placeholder="Nuevo Correo Electrónico"
            value={formData.new_username}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            disabled={cargando}
            className={fieldErrors.new_username ? 'error' : ''}
          />
          {fieldErrors.new_username && (
            <span className="field-error">{fieldErrors.new_username}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="new_password" className="sr-only">Nueva Contraseña</label>
          <div className="password-wrapper">
            <input
              id="new_password"
              type={showPassword ? "text" : "password"}
              name="new_password"
              placeholder="Nueva Contraseña (mínimo 8 caracteres)"
              value={formData.new_password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={cargando}
              className={fieldErrors.new_password ? 'error' : ''}
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
          {fieldErrors.new_password && (
            <span className="field-error">{fieldErrors.new_password}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirm_password" className="sr-only">Confirmar Nueva Contraseña</label>
          <div className="password-wrapper">
            <input
              id="confirm_password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirm_password"
              placeholder="Confirmar Nueva Contraseña"
              value={formData.confirm_password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={cargando}
              className={fieldErrors.confirm_password ? 'error' : ''}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle"
              disabled={cargando}
              aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showConfirmPassword ? EyeOffIcon : EyeIcon}
            </button>
          </div>
          {fieldErrors.confirm_password && (
            <span className="field-error">{fieldErrors.confirm_password}</span>
          )}
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
          disabled={isSubmitDisabled()}
          className={`submit-button ${isSubmitDisabled() ? 'disabled' : ''}`}
        >
          {cargando ? (
            <>
              {LoadingSpinner}
              Actualizando...
            </>
          ) : (
            '🔄 Actualizar y Continuar'
          )}
        </button>
      </form>

      <div className="auth-info">
        <p>🔒 Esta actualización es requerida por motivos de seguridad.</p>
        <p>📧 Tu nuevo correo electrónico será tu nombre de usuario para futuros inicios de sesión.</p>
      </div>
    </div>
  );
}

export default ForceChangePassword;