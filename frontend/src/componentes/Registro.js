import React, { useState } from 'react';
import './Registro.css';

const API_URL = 'http://localhost:8000/api';

function Registro({ onRegistroExitoso }) {
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

    const PASSWORD_POLICY_ERROR = "Contraseña T-Rex: Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (!@#$%^&*())";

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const validarFormulario = () => {
        const textRegex = /^[a-zA-Z\s]+$/;
        if (!textRegex.test(formData.nombre)) {
            setError('El nombre solo puede contener letras y espacios.');
            return false;
        }
        if (!textRegex.test(formData.apellidos)) {
            setError('Los apellidos solo pueden contener letras y espacios.');
            return false;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            setError('Por favor, introduce un correo electrónico válido.');
            return false;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setError(PASSWORD_POLICY_ERROR);
            return false;
        }

        if (!formData.privacidad) {
            setError('Debes aceptar la política de privacidad para continuar.');
            return false;
        }
        return true;
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

            onRegistroExitoso(formData.email);

        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>Crear Cuenta</h2>
            <form onSubmit={handleSubmit} noValidate>
                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="apellidos"
                    placeholder="Apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Correo Electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <div className="password-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Contraseña"
                        value={formData.password}
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

                <div className="checkbox-container">
                    <input
                        type="checkbox"
                        id="privacidad"
                        name="privacidad"
                        checked={formData.privacidad}
                        onChange={handleChange}
                    />
                    <label htmlFor="privacidad">
                        * Acepto la <strong>Política de Privacidad</strong>
                    </label>
                </div>

                <div className="checkbox-container">
                    <input
                        type="checkbox"
                        id="publicidad"
                        name="publicidad"
                        checked={formData.publicidad}
                        onChange={handleChange}
                    />
                    <label htmlFor="publicidad">
                        Acepto recibir comunicaciones comerciales
                    </label>
                </div>

                {error && <p className="error">{error}</p>}

                <button type="submit" disabled={cargando}>
                    {cargando ? 'Registrando...' : 'Crear Cuenta'}
                </button>
            </form>
        </div>
    );
}

export default Registro;