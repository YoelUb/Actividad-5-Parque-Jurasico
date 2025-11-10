import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import MapaJurassic from './MapaJurassic';
import ModalConfirmacion from './ModalConfirmacion';

const AdminDashboard = ({ onSalirClick }) => {
    const [users, setUsers] = useState([]);
    const [dinosaurios, setDinosaurios] = useState([]);
    const [newDino, setNewDino] = useState({
        nombre: '',
        especie: '',
        dieta: '',
        latitud: 0,
        longitud: 0,
    });
    const [error, setError] = useState('');

    const [promoModalAbierto, setPromoModalAbierto] = useState(false);
    const [emailStatus, setEmailStatus] = useState({
        loading: false,
        message: '',
        error: false,
    });

    const token = localStorage.getItem('jurassic_token');

    const authHeaders = useMemo(
        () => ({
            headers: { Authorization: `Bearer ${token}` },
        }),
        [token]
    );

    useEffect(() => {
        const fetchData = async () => {
            try {

                setUsers([
                    { id: 1, username: 'AlanGrant', is_admin: true },
                    { id: 2, username: 'EllieSattler', is_admin: false },
                ]);
                setDinosaurios([
                    { id: 1, nombre: 'Rexy', especie: 'T-Rex', latitud: 10.45, longitud: -84.12 },
                    { id: 2, nombre: 'Blue', especie: 'Velociraptor', latitud: 10.48, longitud: -84.09 },
                ]);

                setError('');
            } catch (err) {
                console.error(err);
                setError('Error al cargar los datos. ¿Tu token sigue siendo válido?');
            }
        };

        if (token) {
            fetchData();
        } else {
            setError('No se encontró un token válido. Inicia sesión nuevamente.');
        }
    }, [token, authHeaders]);

    const handleDinoSubmit = async (e) => {
        e.preventDefault();
        try {

            const nuevoId = dinosaurios.length + 1;
            setDinosaurios([...dinosaurios, { ...newDino, id: nuevoId }]);
            setNewDino({ nombre: '', especie: '', dieta: '', latitud: 0, longitud: 0 });
            setError('');
        } catch (err) {
            console.error(err);
            setError('Error al crear el dinosaurio.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDino({ ...newDino, [name]: value });
    };

    const handleSendPromoEmail = async () => {
        setPromoModalAbierto(false);
        setEmailStatus({ loading: true, message: '', error: false });
        try {
            const response = await axios.post('/api/admin/enviar-publicidad', {}, authHeaders);
            setEmailStatus({
                loading: false,
                message: response.data.message || 'Correos enviados con éxito.',
                error: false,
            });
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.detail || 'Error al enviar los correos.';
            setEmailStatus({ loading: false, message: errorMsg, error: true });
        }
    };

    return (
        <div className="admin-dashboard">
            <h2>Panel de Administración del Parque</h2>
            {error && <p className="error-message">{error}</p>}

            <div className="dashboard-section">
                <h3>Mapa de Recintos</h3>
                <MapaJurassic onSalirClick={onSalirClick} />
            </div>

            <div className="dashboard-section">
                <h3>Marketing (UAX)</h3>
                <p>Enviar correo promocional a todos los usuarios activos que aceptaron publicidad.</p>
                <button
                    onClick={() => setPromoModalAbierto(true)}
                    disabled={emailStatus.loading}
                    className="promo-button"
                >
                    {emailStatus.loading ? 'Enviando...' : 'Enviar Correo Promocional Semanal'}
                </button>
                {emailStatus.message && (
                    <p className={emailStatus.error ? 'error-message' : 'success-message'}>
                        {emailStatus.message}
                    </p>
                )}
            </div>

            <div className="dashboard-section-flex">
                <div className="dashboard-section">
                    <h3>Añadir Nuevo Dinosaurio</h3>
                    <form onSubmit={handleDinoSubmit} className="dino-form">
                        <input
                            type="text"
                            name="nombre"
                            value={newDino.nombre}
                            onChange={handleInputChange}
                            placeholder="Nombre (Ej: Rexy)"
                            required
                        />
                        <input
                            type="text"
                            name="especie"
                            value={newDino.especie}
                            onChange={handleInputChange}
                            placeholder="Especie (Ej: T-Rex)"
                            required
                        />
                        <input
                            type="text"
                            name="dieta"
                            value={newDino.dieta}
                            onChange={handleInputChange}
                            placeholder="Dieta (Ej: Carnívoro)"
                            required
                        />
                        <input
                            type="number"
                            name="latitud"
                            value={newDino.latitud}
                            onChange={handleInputChange}
                            placeholder="Latitud (Ej: 10.45)"
                            step="any"
                            required
                        />
                        <input
                            type="number"
                            name="longitud"
                            value={newDino.longitud}
                            onChange={handleInputChange}
                            placeholder="Longitud (Ej: -84.12)"
                            step="any"
                            required
                        />
                        <button type="submit">Añadir Dinosaurio</button>
                    </form>
                </div>

                <div className="dashboard-section">
                    <h3>Dinosaurios en la Base de Datos</h3>
                    <ul className="data-list">
                        {dinosaurios.map((dino) => (
                            <li key={dino.id}>
                                {dino.nombre} ({dino.especie}) - Coords: [{dino.latitud}, {dino.longitud}]
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="dashboard-section">
                <h3>Usuarios Registrados</h3>
                <ul className="data-list">
                    {users.map((user) => (
                        <li key={user.id}>
                            {user.username} {user.is_admin ? <strong>(Admin)</strong> : '(Usuario)'}
                        </li>
                    ))}
                </ul>
            </div>

            <ModalConfirmacion
                isOpen={promoModalAbierto}
                onClose={() => setPromoModalAbierto(false)}
                onConfirm={handleSendPromoEmail}
                message="¿Confirmas el envío del correo promocional a todos los usuarios válidos? (Límite: 1 vez por semana)"
            />
        </div>
    );
};

export default AdminDashboard;
