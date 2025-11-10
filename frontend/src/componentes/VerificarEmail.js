import React, { useState } from 'react';
import './VerificarEmail.css';

const API_URL = 'http://localhost:8000/api';

function VerificarEmail({ email, onVerificationSuccess }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (token.length !== 6 || !/^\d+$/.test(token)) {
      setError('El código debe ser de 6 dígitos numéricos.');
      return;
    }

    setCargando(true);
    try {
      const respuesta = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          code: token,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.detail || 'Error al verificar el código');
      }

      onVerificationSuccess();

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Verificar Cuenta</h2>
      <p className="verify-text">
        Se ha enviado un código de 6 dígitos a <strong>{email}</strong>.
      </p>
      <p className="verify-text">Revisa tu bandeja de entrada (y spam).</p>

      <form onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          name="token"
          placeholder="Código de 6 dígitos"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          maxLength={6}
          required
          className="token-input"
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Verificando...' : 'Activar Cuenta'}
        </button>
      </form>
    </div>
  );
}

export default VerificarEmail;