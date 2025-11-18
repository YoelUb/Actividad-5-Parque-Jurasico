import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './RequestPasswordReset.css';

function RequestPasswordReset() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`/api/auth/password-recovery/${email}`);
            setMessage(response.data.mensaje);
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.detail || "Ocurrió un error. Por favor, inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="request-reset-container">
            <div className="request-reset-card">
                <div className="request-reset-header">
                    <div className="request-reset-logo">
                        <svg viewBox="0 0 24 24">
                            <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7C21,5.9 20.1,5 19,5C17.9,5 17,5.9 17,7V9C15.9,9 15,9.9 15,11V16C15,17.1 15.9,18 17,18H19C20.1,18 21,17.1 21,16V11C21,9.9 20.1,9 19,9M19,7V9H17V7H19M7,9V7C7,5.9 6.1,5 5,5C3.9,5 3,5.9 3,7V9C1.9,9 1,9.9 1,11V16C1,17.1 1.9,18 3,18H5C6.1,18 7,17.1 7,16V11C7,9.9 6.1,9 5,9M5,7V9H3V7H5M12,8C14.2,8 16,9.8 16,12V18C16,19.1 15.1,20 14,20H10C8.9,20 8,19.1 8,18V12C8,9.8 9.8,8 12,8M12,10C10.9,10 10,10.9 10,12V18H14V12C14,10.9 13.1,10 12,10Z"/>
                        </svg>
                    </div>
                    <h1 className="request-reset-title">Recuperar Contraseña</h1>
                    <p className="request-reset-subtitle">
                        Introduce tu email y te enviaremos un enlace para resetear tu contraseña
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="request-reset-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="tu@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar Enlace de Reseteo'}
                    </button>
                </form>

                {message && <div className="message-success">{message}</div>}
                {error && <div className="message-error">{error}</div>}

                <div className="back-link">
                    <Link to="/login">← Volver al Inicio de Sesión</Link>
                </div>
            </div>
        </div>
    );
}

export default RequestPasswordReset;