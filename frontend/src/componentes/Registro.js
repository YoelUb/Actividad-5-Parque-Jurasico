import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Registro.css';

const API_URL = 'http://localhost:8000/api';

function Registro() {
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        password: '',
        privacidad: false,
        publicidad: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });
    const navigate = useNavigate();

    const PASSWORD_POLICY_ERROR = "Contraseña T-Rex: Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (!@#$%^&*())";

    // Iconos SVG
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

    const LoadingSpinner = (
        <svg className="loading-spinner" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <style>
                {`.spinner_aj0A{transform-origin:center;animation:spinner_KYSC .75s infinite linear}@keyframes spinner_KYSC{100%{transform:rotate(360deg)}}`}
            </style>
            <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
            <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" className="spinner_aj0A"/>
        </svg>
    );

    useEffect(() => {
        const password = formData.password;
        const strength = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*()]/.test(password)
        };
        setPasswordStrength(strength);
    }, [formData.password]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (type !== 'checkbox') {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        setError(null);
    };

    const validateField = (name, value) => {
        const errors = {};

        switch (name) {
            case 'nombre':
            case 'apellidos':
                const textRegex = /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/;
                if (!textRegex.test(value)) {
                    errors[name] = 'Solo se permiten letras y espacios';
                }
                break;
            case 'email':
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(value)) {
                    errors[name] = 'Formato de email inválido';
                }
                break;
            case 'password':
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,}$/;
                if (!passwordRegex.test(value)) {
                    errors[name] = PASSWORD_POLICY_ERROR;
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

    const validarFormulario = () => {
        const errors = {};

        errors.nombre = validateField('nombre', formData.nombre);
        errors.apellidos = validateField('apellidos', formData.apellidos);
        errors.email = validateField('email', formData.email);
        errors.password = validateField('password', formData.password);

        setFieldErrors(errors);

        if (!formData.privacidad) {
            setError('Debes aceptar la política de privacidad para continuar.');
            return false;
        }

        const hasErrors = Object.values(errors).some(error => error !== '');
        return !hasErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validarFormulario()) {
            return;
        }

        setCargando(true);
        try {
            const respuesta = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.email,
                    password: formData.password,
                    nombre: formData.nombre,
                    apellidos: formData.apellidos,
                    acepta_publicidad: formData.publicidad,
                }),
            });

            const data = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(data.detail || 'Error al registrar el usuario');
            }

            navigate('/verificar-email', { state: { email: formData.email } });

        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const isSubmitDisabled = () => {
        return cargando ||
               !formData.privacidad ||
               !formData.nombre ||
               !formData.apellidos ||
               !formData.email ||
               !formData.password;
    };

    return (
        <div className="registro-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7C21 5.9 20.1 5 19 5C17.9 5 17 5.9 17 7V9C15.9 9 15 9.9 15 11V16C15 17.1 15.9 18 17 18H19C20.1 18 21 17.1 21 16V11C21 9.9 20.1 9 19 9ZM19 7V9H17V7H19ZM7 9V7C7 5.9 6.1 5 5 5C3.9 5 3 5.9 3 7V9C1.9 9 1 9.9 1 11V16C1 17.1 1.9 18 3 18H5C6.1 18 7 17.1 7 16V11C7 9.9 6.1 9 5 9ZM5 7V9H3V7H5ZM12 8C14.2 8 16 9.8 16 12V18C16 19.1 15.1 20 14 20H10C8.9 20 8 19.1 8 18V12C8 9.8 9.8 8 12 8Z"/>
                        </svg>
                    </div>
                    <h2>Crear Cuenta</h2>
                    <p>Únete a la aventura jurásica</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="auth-form">
                    <div className="form-group">
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            disabled={cargando}
                            className={fieldErrors.nombre ? 'error' : ''}
                        />
                        {fieldErrors.nombre && <span className="field-error">{fieldErrors.nombre}</span>}
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            name="apellidos"
                            placeholder="Apellidos"
                            value={formData.apellidos}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            disabled={cargando}
                            className={fieldErrors.apellidos ? 'error' : ''}
                        />
                        {fieldErrors.apellidos && <span className="field-error">{fieldErrors.apellidos}</span>}
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Correo Electrónico"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            disabled={cargando}
                            className={fieldErrors.email ? 'error' : ''}
                        />
                        {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                    </div>

                    <div className="form-group">
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Contraseña"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                disabled={cargando}
                                className={fieldErrors.password ? 'error' : ''}
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

                        {formData.password && (
                            <div className="password-requirements">
                                <div className={`requirement ${passwordStrength.length ? 'valid' : 'invalid'}`}>
                                    {passwordStrength.length ? CheckIcon : XIcon}
                                    Mínimo 8 caracteres
                                </div>
                                <div className={`requirement ${passwordStrength.uppercase ? 'valid' : 'invalid'}`}>
                                    {passwordStrength.uppercase ? CheckIcon : XIcon}
                                    1 letra mayúscula
                                </div>
                                <div className={`requirement ${passwordStrength.lowercase ? 'valid' : 'invalid'}`}>
                                    {passwordStrength.lowercase ? CheckIcon : XIcon}
                                    1 letra minúscula
                                </div>
                                <div className={`requirement ${passwordStrength.number ? 'valid' : 'invalid'}`}>
                                    {passwordStrength.number ? CheckIcon : XIcon}
                                    1 número
                                </div>
                                <div className={`requirement ${passwordStrength.special ? 'valid' : 'invalid'}`}>
                                    {passwordStrength.special ? CheckIcon : XIcon}
                                    1 símbolo (!@#$%^&*())
                                </div>
                            </div>
                        )}
                        {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                    </div>

                    <div className="checkbox-group">
                        <div className="checkbox-container required">
                            <input
                                type="checkbox"
                                id="privacidad"
                                name="privacidad"
                                checked={formData.privacidad}
                                onChange={handleChange}
                                disabled={cargando}
                            />
                            <label htmlFor="privacidad">
                                Acepto la <strong>Política de Privacidad</strong>
                            </label>
                        </div>

                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                id="publicidad"
                                name="publicidad"
                                checked={formData.publicidad}
                                onChange={handleChange}
                                disabled={cargando}
                            />
                            <label htmlFor="publicidad">
                                Acepto recibir comunicaciones comerciales
                            </label>
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
                        disabled={isSubmitDisabled()}
                        className={`submit-button ${isSubmitDisabled() ? 'disabled' : ''}`}
                    >
                        {cargando ? (
                            <>
                                {LoadingSpinner}
                                Creando cuenta...
                            </>
                        ) : (
                            'Crear Cuenta'
                        )}
                    </button>
                </form>

                <div className="auth-switch">
                    <p>
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="auth-link">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Registro;