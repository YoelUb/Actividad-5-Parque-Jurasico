import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './Auth.css';
import './ResetPassword.css';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    // Estados para validación de contraseña
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        number: false,
        special: false
    });
    const [passwordsMatch, setPasswordsMatch] = useState(false);

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

    const CheckIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    );

    const XIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    );

    useEffect(() => {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };
        setPasswordRequirements(requirements);

        setPasswordsMatch(password === confirmPassword && password !== '');
    }, [password, confirmPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (!token) {
            setError("Token no encontrado. Solicita un nuevo reseteo.");
            return;
        }

        const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
        if (!allRequirementsMet) {
            setError("La contraseña no cumple con todos los requisitos de seguridad.");
            return;
        }

        setError('');
        setMessage('');
        setCargando(true);

        try {
            const response = await axios.post('/api/auth/reset-password/', {
                token: token,
                new_password: password
            });
            setMessage(response.data.mensaje + " Serás redirigido al login.");
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.detail || "El token es inválido o ha expirado.");
        } finally {
            setCargando(false);
        }
    };

    const isSubmitDisabled = () => {
        return cargando ||
               !passwordsMatch ||
               !Object.values(passwordRequirements).every(req => req) ||
               password === '' ||
               confirmPassword === '';
    };

    return (
        <div className="auth-container">
            <div className="reset-password-header">
                <div className="password-lock-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
                <h2>Nueva Contraseña</h2>
                <p className="reset-subtitle">
                    Introduce tu nueva contraseña a continuación. Asegúrate de que cumpla con los requisitos de seguridad.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="reset-password-form">

                <div className="form-group">
                    <label htmlFor="newPassword" className="reset-password-label">Nueva Contraseña</label>
                    <div className="reset-password-wrapper">
                        <input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Ingresa tu nueva contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={password && !Object.values(passwordRequirements).every(req => req) ? 'error' : ''}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="reset-eye-button"
                            tabIndex="-1"
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPassword ? EyeOffIcon : EyeIcon}
                        </button>
                    </div>

                    <div className="password-requirements">
                        <div className={`requirement ${passwordRequirements.length ? 'valid' : 'invalid'}`}>
                            {passwordRequirements.length ? CheckIcon : XIcon}
                            Al menos 8 caracteres
                        </div>
                        <div className={`requirement ${passwordRequirements.uppercase ? 'valid' : 'invalid'}`}>
                            {passwordRequirements.uppercase ? CheckIcon : XIcon}
                            Al menos una letra mayúscula
                        </div>
                        <div className={`requirement ${passwordRequirements.number ? 'valid' : 'invalid'}`}>
                            {passwordRequirements.number ? CheckIcon : XIcon}
                            Al menos un número
                        </div>
                        <div className={`requirement ${passwordRequirements.special ? 'valid' : 'invalid'}`}>
                            {passwordRequirements.special ? CheckIcon : XIcon}
                            Al menos un carácter especial
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword" className="reset-password-label">Confirmar Contraseña</label>
                    <div className="reset-password-wrapper">
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirma tu nueva contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={confirmPassword && !passwordsMatch ? 'error' : ''}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="reset-eye-button"
                            tabIndex="-1"
                            aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showConfirmPassword ? EyeOffIcon : EyeIcon}
                        </button>
                    </div>

                    <div className="password-requirements">
                        <div className={`requirement ${passwordsMatch ? 'valid' : 'invalid'}`}>
                            {passwordsMatch ? CheckIcon : XIcon}
                            Las contraseñas coinciden
                        </div>
                    </div>
                </div>

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}

                <button
                    type="submit"
                    disabled={isSubmitDisabled()}
                    className={`submit-btn ${isSubmitDisabled() ? 'disabled' : ''}`}
                >
                    {cargando ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
            </form>
        </div>
    );
}

export default ResetPassword;