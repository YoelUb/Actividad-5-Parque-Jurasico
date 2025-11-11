import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import ModalConfirmacion from './ModalConfirmacion';

const AdminDashboard = ({ onSalirClick }) => {
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState('');

    const [promoModalAbierto, setPromoModalAbierto] = useState(false);
    const [emailStatus, setEmailStatus] = useState({
        loading: false,
        message: '',
        error: false,
    });

    const [jeepColor, setJeepColor] = useState('Green');
    const [carnivoreDino, setCarnivoreDino] = useState('RedDino');
    const [herbivoreDino, setHerbivoreDino] = useState('BlueDino');
    const [aviaryDino, setAviaryDino] = useState('YellowDino');
    const [aquaDino, setAquaDino] = useState('DarkGreenDino');

    const token = localStorage.getItem('jurassic_token');

    const authHeaders = useMemo(
        () => ({
            headers: { Authorization: `Bearer ${token}` },
        }),
        [token]
    );

    const dinoOptions = [
        { value: 'RedDino', label: 'T-Rex (Rojo)', path: '/RedDino/RedDinosaur1.png' },
        { value: 'BlueDino', label: 'Raptor (Azul)', path: '/BlueDino/BlueDinosaur1.png' },
        { value: 'YellowDino', label: 'Dino (Amarillo)', path: '/yellowDino/YellowDinosaur1.png' },
        { value: 'DarkGreenDino', label: 'Dino (Verde Osc.)', path: '/DarkGreenDino/DarkGreenDinosaur1.png' },
        { value: 'liteGreenDino', label: 'Dino (Verde Cla.)', path: '/liteGreenDino/LightGreenDinosaur1.png' },
    ];

    const jeepOptions = [
        { value: 'Green', label: 'Jeep Verde', path: '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_000.png' },
        { value: 'Brown', label: 'Jeep Marrón', path: '/Jeep/Jeep_Brown/MOVE/SOUTH/SEPARATED/Brown_JEEP_CLEAN_SOUTH_000.png' },
        { value: 'Black', label: 'Jeep Negro', path: '/Jeep/Jeep_Black/MOVE/SOUTH/SEPARATED/Black_JEEP_CLEAN_SOUTH_000.png' },
    ];

    const getPreviewPath = (options, value) => {
        const selected = options.find(opt => opt.value === value);
        return selected ? selected.path : '';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setUsers([
                    { id: 1, username: 'AlanGrant@jp.com', role: 'admin', is_active: true },
                    { id: 2, username: 'EllieSattler@jp.com', role: 'admin', is_active: true },
                    { id: 3, username: 'IanMalcolm@jp.com', role: 'visitante', is_active: true },
                    { id: 4, username: 'JohnHammond@jp.com', role: 'visitante', is_active: false },
                ]);

                setLogs([
                  { id: 1, timestamp: '2025-11-10 14:30:12', user: 'AlanGrant@jp.com', action: 'Envió correo de marketing' },
                  { id: 2, timestamp: '2025-11-10 10:05:01', user: 'IanMalcolm@jp.com', action: 'Inició sesión' },
                  { id: 3, timestamp: '2025-11-09 18:22:45', user: 'EllieSattler@jp.com', action: 'Forzó cambio de contraseña a JohnHammond@jp.com' },
                  { id: 4, timestamp: '2025-11-09 15:12:00', user: 'IanMalcolm@jp.com', action: 'Accedió al Laboratorio' },
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

    const handleAssetSave = () => {
        console.log("Guardando configuración de assets:");
        console.log({
            jeep: jeepColor,
            carnivoro: carnivoreDino,
            herbivoro: herbivoreDino,
            aviario: aviaryDino,
            acuario: aquaDino,
        });
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h2>Panel de Administración del Parque</h2>
                <button onClick={onSalirClick} className="admin-logout-btn">Salir</button>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="admin-grid">

                <div className="dashboard-section terminal-list">
                    <h3>Usuarios Registrados</h3>
                    <div className="admin-list-container">
                        <ul className="admin-list">
                            {users.map((user) => (
                                <li key={user.id}>
                                    <span>{user.username}</span>
                                    <span className={user.is_active ? 'status-active' : 'status-inactive'}>
                                        {user.is_active ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                    <span className="role-tag">{user.role}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="dashboard-section terminal-list">
                    <h3>Historial de Actividad (Logs)</h3>
                    <div className="admin-list-container">
                        <ul className="admin-list log-list">
                            {logs.map((log) => (
                                <li key={log.id}>
                                    <span>[{log.timestamp}]</span>
                                    <span className="log-user">{log.user}:</span>
                                    <span>{log.action}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="dashboard-section asset-config-section">
                    <h3>Configuración de Assets</h3>
                    <div className="asset-config-grid">

                        <div className="asset-selector">
                            <label>Transporte (Coche)</label>
                            <img src={getPreviewPath(jeepOptions, jeepColor)} alt="Jeep" className="asset-preview" />
                            <select value={jeepColor} onChange={(e) => setJeepColor(e.target.value)}>
                                {jeepOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="asset-selector">
                            <label>Recinto Carnívoros</label>
                            <img src={getPreviewPath(dinoOptions, carnivoreDino)} alt="Dino" className="asset-preview" />
                            <select value={carnivoreDino} onChange={(e) => setCarnivoreDino(e.target.value)}>
                                {dinoOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="asset-selector">
                            <label>Recinto Herbívoros</label>
                            <img src={getPreviewPath(dinoOptions, herbivoreDino)} alt="Dino" className="asset-preview" />
                            <select value={herbivoreDino} onChange={(e) => setHerbivoreDino(e.target.value)}>
                                {dinoOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="asset-selector">
                            <label>Recinto Aviario</label>
                            <img src={getPreviewPath(dinoOptions, aviaryDino)} alt="Dino" className="asset-preview" />
                            <select value={aviaryDino} onChange={(e) => setAviaryDino(e.target.value)}>
                                {dinoOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="asset-selector">
                            <label>Recinto Acuario</label>
                            <img src={getPreviewPath(dinoOptions, aquaDino)} alt="Dino" className="asset-preview" />
                            <select value={aquaDino} onChange={(e) => setAquaDino(e.target.value)}>
                                {dinoOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                    </div>
                    <button onClick={handleAssetSave} className="promo-button save-assets-btn">
                        Guardar Cambios de Assets
                    </button>
                </div>

                <div className="dashboard-section">
                    <h3>Marketing (UAX)</h3>
                    <p>Enviar correo promocional a todos los usuarios activos.</p>
                    <button
                        onClick={() => setPromoModalAbierto(true)}
                        disabled={emailStatus.loading}
                        className="promo-button"
                    >
                        {emailStatus.loading ? 'Enviando...' : 'Enviar Correo Promocional'}
                    </button>
                    {emailStatus.message && (
                        <p className={emailStatus.error ? 'error-message' : 'success-message'}>
                            {emailStatus.message}
                        </p>
                    )}
                </div>

            </div>

            <ModalConfirmacion
                isOpen={promoModalAbierto}
                onClose={() => setPromoModalAbierto(false)}
                onConfirm={handleSendPromoEmail}
                message="¿Confirmas el envío del correo promocional a todos los usuarios válidos?"
            />
        </div>
    );
};

export default AdminDashboard;