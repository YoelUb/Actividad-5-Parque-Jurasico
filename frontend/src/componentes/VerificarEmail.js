import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './VerificarEmail.css';
import './Auth.css';

const API_URL = 'http://localhost:8000/api';

function VerificarEmail() {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleVerification = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, code: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al verificar el código');
      }

      setMessage(data.message || '¡Correo verificado exitosamente!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setMessage('Solicitando reenvío...');

    try {
      const response = await fetch(`${API_URL}/auth/resend-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, code: "RESEND" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al reenviar código');
      }

      setMessage('¡Nuevo código enviado! Revisa tu correo.');

    } catch (err) {
      setError(err.message);
      setMessage('');
    }
  };

  return (
    <div className="auth-container verify-container">
      <h2>Verifica tu Correo Electrónico</h2>
      <p>Hemos enviado un código de verificación a:</p>
      <p><strong>{email || 'tu correo'}</strong></p>
      <p>Por favor, introduce el código para activar tu cuenta.</p>

      <form onSubmit={handleVerification}>
        <input
          type="text"
          placeholder="Código de Verificación"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          className="verification-code-input"
        />

        {error && <p className="error">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Verificando...' : 'Verificar Cuenta'}
        </button>
      </form>

      <div className="auth-switch">
        <p>
          ¿No recibiste el código?{' '}
          <button onClick={handleResend} className="link-button">
            Reenviar código
          </button>
        </p>
        <p>
          <Link to="/login" className="link-button">
            Volver a Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default VerificarEmail;