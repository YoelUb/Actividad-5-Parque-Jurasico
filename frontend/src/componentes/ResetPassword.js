import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

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
        setError('');
        setMessage('');

        try {
            const response = await axios.post('/api/auth/reset-password/', {
                token: token,
                new_password: password
            });
            setMessage(response.data.mensaje + " Serás redirigido al login.");
            setTimeout(() => {
                navigate('/auth');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.detail || "El token es inválido o ha expirado.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="p-8 bg-gray-800 rounded-lg shadow-xl w-96">
                <h2 className="text-2xl font-bold text-white text-center mb-6">Nueva Contraseña</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Nueva Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
                        Actualizar Contraseña
                    </button>
                </form>
                {message && <p className="text-green-400 text-center mt-4">{message}</p>}
                {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            </div>
        </div>
    );
}

export default ResetPassword;