import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import ModalConfirmacion from './ModalConfirmacion';
import AdminDinoSelectModal from './AdminDinoSelectModal';

const API_URL = 'http://localhost:8000/api';

const AdminDashboard = ({ onSalirClick }) => {
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const [promoModalAbierto, setPromoModalAbierto] = useState(false);
    const [dinoSelectModalOpen, setDinoSelectModalOpen] = useState(false);
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

    const [saveStatus, setSaveStatus] = useState({
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

    const trexOptions = [
        {
            value: 'RedDino',
            label: 'T-Rex (Rojo)',
            path: '/RedDino/RedDinosaur',
            previewPath: '/RedDino/RedDinosaur1.png',
            info: 'El Tyrannosaurus Rex, con su distintiva coloración roja, es la atracción principal.'
        },
        {
            value: 'BlueDino',
            label: 'T-Rex (Azul)',
            path: '/BlueDino/BlueDinosaur',
            previewPath: '/BlueDino/BlueDinosaur1.png',
            info: 'Una variante genética de T-Rex, resultado de la experimentación. Su color azul lo hace único.'
        },
        {
            value: 'YellowDino',
            label: 'T-Rex (Amarillo)',
            path: '/yellowDino/YellowDinosaur',
            previewPath: '/yellowDino/YellowDinosaur1.png',
            info: 'Adaptado para camuflaje en zonas más áridas, esta variante amarilla es igual de imponente.'
        },
         {
            value: 'DarkGreenDino',
            label: 'T-Rex (Verde Oscuro)',
            path: '/DarkGreenDino/DarkGreenDinosaur',
            previewPath: '/DarkGreenDino/DarkGreenDinosaur1.png',
            info: 'Una variante adaptada al camuflaje de jungla densa. Más difícil de ver, pero igual de letal.'
        },
        {
            value: 'liteGreenDino',
            label: 'T-Rex (Verde claro)',
            path: '/liteGreenDino/LightGreenDinosaur',
            previewPath: '/liteGreenDino/LightGreenDinosaur1.png',
            info: 'Una mutación más joven y ágil, su coloración clara le permite cazar en praderas abiertas.'
        },
    ];

    const getPreviewPath = (options, value) => {
        let selected = trexOptions.find(opt => opt.value === value);
        if (selected) return selected.previewPath;

        selected = dinoOptions.find(opt => opt.value === value);
        if (selected) return selected.path;

        selected = jeepOptions.find(opt => opt.value === value);
        if (selected) return selected.path;

        return '';
    };


    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true);
            try {
                const [usersRes, logsRes] = await Promise.all([
                    axios.get(`${API_URL}/admin/users/`, authHeaders),
                    axios.get(`${API_URL}/admin/logs/marketing`, authHeaders)
                ]);
                setUsers(usersRes.data);
                setLogs(logsRes.data);

                const assetsRes = await axios.get(`${API_URL}/assets/config`);
                const config = assetsRes.data;
                setJeepColor(config.jeepColor);
                setCarnivoreDino(config.carnivoreDino);
                setHerbivoreDino(config.herbivoreDino);
                setAviaryDino(config.aviaryDino);
                setAquaDino(config.aquaDino);

                setError('');
            } catch (err) {
                console.error(err);
                setError('Error al cargar los datos del panel.');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchAdminData();
        } else {
            setError('No se encontró un token válido.');
            setLoading(false);
        }
    }, [token, authHeaders]);

    const handleSendPromoEmail = async () => {
        setPromoModalAbierto(false);
        setEmailStatus({ loading: true, message: '', error: false });
        try {
            const response = await axios.post(`${API_URL}/admin/enviar-publicidad`, {}, authHeaders);
            setEmailStatus({
                loading: false,
                message: response.data.message || 'Correos enviados con éxito.',
                error: false,
            });

            const logsRes = await axios.get(`${API_URL}/admin/logs/marketing`, authHeaders);
            setLogs(logsRes.data);

        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.detail || 'Error al enviar los correos.';
            setEmailStatus({ loading: false, message: errorMsg, error: true });
        }
    };

    const handleSelectCarnivoreDino = (dinoValue) => {
        setCarnivoreDino(dinoValue);
        setDinoSelectModalOpen(false);
    };

    const handleAssetSave = async () => {
        setSaveStatus({ loading: true, message: '', error: false });

        const configData = {
            jeepColor: jeepColor,
            carnivoreDino: carnivoreDino,
            herbivoreDino: herbivoreDino,
            aviaryDino: aviaryDino,
            aquaDino: aquaDino,
        };

        try {
            const response = await axios.put(
                `${API_URL}/assets/config`,
                configData,
                authHeaders
            );

            setSaveStatus({
                loading: false,
                message: response.data.message || 'Configuración guardada.',
                error: false,
            });

            setTimeout(() => setSaveStatus({ ...saveStatus, message: '' }), 3000);

        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.detail || 'Error al guardar la configuración.';
            setSaveStatus({ loading: false, message: errorMsg, error: true });
        }
    };

    const formatTimestamp = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h2>Panel de Administración del Parque</h2>
                <button onClick={onSalirClick} className="admin-logout-btn">Salir</button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <div className="admin-loading">Cargando datos del panel...</div>
            ) : (
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
                        <h3>Logs de Marketing</h3>
                        <div className="admin-list-container">
                            <ul className="admin-list log-list">
                                {logs.map((log) => (
                                    <li key={log.id}>
                                        <span>[{formatTimestamp(log.timestamp)}]</span>
                                        <span className="log-user">{log.admin_username}:</span>
                                        <span>Envió campaña a {log.destinatarios_count} usuarios.</span>
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
                                <label>Recinto Carnívoros (T-Rex)</label>
                                <img src={getPreviewPath(trexOptions, carnivoreDino)} alt="Dino Carnívoro" className="asset-preview" />
                                <button
                                    className="change-asset-btn"
                                    onClick={() => setDinoSelectModalOpen(true)}
                                >
                                    Cambiar Dinosaurio
                                </button>
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

                        <button onClick={handleAssetSave} className="promo-button save-assets-btn" disabled={saveStatus.loading}>
                            {saveStatus.loading ? "Guardando..." : "Guardar Cambios de Assets"}
                        </button>
                        {saveStatus.message && (
                            <p className={saveStatus.error ? 'error-message' : 'success-message'} style={{marginTop: '10px'}}>
                                {saveStatus.message}
                            </p>
                        )}
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
            )}

            <ModalConfirmacion
                isOpen={promoModalAbierto}
                onClose={() => setPromoModalAbierto(false)}
                onConfirm={handleSendPromoEmail}
                message="¿Confirmas el envío del correo promocional a todos los usuarios válidos?"
            />

            <AdminDinoSelectModal
              isOpen={dinoSelectModalOpen}
              onClose={() => setDinoSelectModalOpen(false)}
              onSelectDino={handleSelectCarnivoreDino}
              dinoOptions={trexOptions}
            />
        </div>
    );
};

export default AdminDashboard;