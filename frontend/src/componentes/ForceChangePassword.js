import React, { useState } from 'react';
import './Auth.css';
import './Registro.css';

const API_URL = 'http://localhost:8000/api';

function ForceChangePassword({ token, onPasswordChanged }) {
  const [formData, setFormData] = useState({
    new_username: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Regex simple para validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.new_username) {
      setError('Debes introducir un nuevo correo electrónico.');
      return;
    }

    if (!emailRegex.test(formData.new_username)) {
      setError('El formato del correo electrónico no es válido.');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      setError('Las contraseñas no coinciden.');
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

      onPasswordChanged();

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Actualización Requerida</h2>
      <p>Por seguridad, debes actualizar tu nombre de usuario (email) y contraseña.</p>
      <form onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          name="new_username"
          placeholder="Nuevo Correo Electrónico"
          value={formData.new_username}
          onChange={handleChange}
          required
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="new_password"
            placeholder="Nueva Contraseña (mín. 8 caracteres)"
            value={formData.new_password}
            onChange={handleChange}
            required
          />
          <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle-text"
          >
              {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirm_password"
            placeholder="Confirmar Nueva Contraseña"
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />
          <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle-text"
          >
              {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Actualizando...' : 'Actualizar y Continuar'}
        </button>
      </form>
    </div>
  );
}

export default ForceChangePassword;