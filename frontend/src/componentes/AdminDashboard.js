import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import MapaJurassic from './MapaJurassic';

const AdminDashboard = ({ onSalirClick }) => {
    const [users, setUsers] = useState([]);
    const [dinosaurios, setDinosaurios] = useState([]);
    const [newDino, setNewDino] = useState({ nombre: '', especie: '', dieta: '', latitud: 0, longitud: 0 });
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersResponse = await axios.get('/api/admin/users', authHeaders);
                setUsers(usersResponse.data);

                const dinosResponse = await axios.get('/api/admin/dinosaurio', authHeaders);
                setDinosaurios(dinosResponse.data);

            } catch (err) {
                setError('Error al cargar los datos. ¿Tu token sigue siendo válido?');
                console.error(err);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);


    const handleDinoSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/admin/dinosaurio', newDino, authHeaders);
            setDinosaurios([...dinosaurios, response.data]);
            setNewDino({ nombre: '', especie: '', dieta: '', latitud: 0, longitud: 0 });
            setError('');
        } catch (err) {
            setError('Error al crear el dinosaurio.');
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDino({ ...newDino, [name]: value });
    };


    return (
        <div className="admin-dashboard">
            <h2>Panel de Administración del Parque</h2>
            {error && <p className="error-message">{error}</p>}

            <div className="dashboard-section">
                <h3>Mapa de Recintos (Genially)</h3>
                <MapaJurassic onSalirClick={onSalirClick} />
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
                        {dinosaurios.map(dino => (
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
                    {users.map(user => (
                        <li key={user.id}>
                            {user.username} - {user.is_admin ? <strong>(Admin)</strong> : '(Usuario)'}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboard;