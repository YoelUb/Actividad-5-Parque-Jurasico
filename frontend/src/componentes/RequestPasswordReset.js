import React, { useState } from 'react';
import axios from 'axios';

function RequestPasswordReset() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await axios.post(`/api/auth/password-recovery/${email}`);
            setMessage(response.data.mensaje);
        } catch (err) {
            setError("Ocurrió un error. Por favor, inténtalo de nuevo.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="p-8 bg-gray-800 rounded-lg shadow-xl w-96">
                <h2 className="text-2xl font-bold text-white text-center mb-6">Resetear Contraseña</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200">
                        Enviar Enlace de Reseteo
                    </button>
                </form>
                {message && <p className="text-green-400 text-center mt-4">{message}</p>}
                {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            </div>
        </div>
    );
}

export default RequestPasswordReset;