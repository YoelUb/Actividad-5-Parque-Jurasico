import React, {useState, useEffect, useMemo, useCallback} from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import AdminDinoSelectModal from './AdminDinoSelectModal';

const API_URL = 'http://localhost:8000/api';

const carnivoreOptions = [
    {value: 'RedDino', label: 'T-Rex (Rojo)', previewPath: '/RedDino/RedDinosaur1.png'},
    {value: 'BlueDino', label: 'T-Rex (Azul)', previewPath: '/BlueDino/BlueDinosaur1.png'},
    {value: 'YellowDino', label: 'T-Rex (Amarillo)', previewPath: '/yellowDino/YellowDinosaur1.png'},
    {value: 'DarkGreenDino', label: 'T-Rex (Verde Oscuro)', previewPath: '/DarkGreenDino/DarkGreenDinosaur1.png'},
    {value: 'liteGreenDino', label: 'T-Rex (Verde Claro)', previewPath: '/liteGreenDino/LightGreenDinosaur1.png'},
    {value: 'Dino_Especial', label: 'Spinosaurus', previewPath: '/Dino_Especial/idle/Spino.png'}
];

const herbivoreOptions = [
    {value: 'triceratops', label: 'Triceratops', previewPath: '/triceraptors/triceraptors1.png'},
    {value: 'broncosaurio_azul', label: 'Brontosaurus (Azul)', previewPath: '/broncosaurio_azul/idle/broncosaurio1.png'}
];

const jeepOptions = [
    {
        value: 'Green',
        label: 'Jeep Verde',
        previewPath: '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_000.png'
    },
    {
        value: 'Brown',
        label: 'Jeep Marrón',
        previewPath: '/Jeep/Jeep_Brown/MOVE/SOUTH/SEPARATED/Brown_JEEP_CLEAN_SOUTH_000.png'
    },
    {
        value: 'Black',
        label: 'Jeep Negro',
        previewPath: '/Jeep/Jeep_Black/MOVE/SOUTH/SEPARATED/Black_JEEP_CLEAN_SOUTH_000.png'
    }
];

const previewPaths = {
    volador: '/volador/volador1.png',
    marino: '/marino/marino1.png'
};

const getPreviewPath = (value, list) => {
    const item = list.find(o => o.value === value);
    return item ? item.previewPath : '';
};

const AdminDashboard = ({onSalirClick}) => {
    const [jeepColor, setJeepColor] = useState('Green');
    const [carnivoreDino, setCarnivoreDino] = useState('RedDino');
    const [herbivoreDino, setHerbivoreDino] = useState('triceratops');
    const [aviaryDino] = useState('volador');
    const [aquaDino] = useState('marino');

    const [carnivoreModalOpen, setCarnivoreModalOpen] = useState(false);
    const [herbivoreModalOpen, setHerbivoreModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sendingCampaign, setSendingCampaign] = useState(false);

    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');

    const token = localStorage.getItem('jurassic_token');

    const authHeaders = useMemo(
        () => ({headers: {Authorization: `Bearer ${token}`}}),
        [token]
    );

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [usersRes, logsRes, assetsRes] = await Promise.all([
                axios.get(`${API_URL}/admin/users/`, authHeaders),
                axios.get(`${API_URL}/admin/logs/marketing`, authHeaders),
                axios.get(`${API_URL}/assets/config`, authHeaders)
            ]);

            const cfg = assetsRes.data;
            setJeepColor(cfg.jeepColor || 'Green');
            setCarnivoreDino(cfg.carnivoreDino || 'RedDino');
            setHerbivoreDino(cfg.herbivoreDino || 'triceratops');

            setUsers(usersRes.data);
            setLogs(logsRes.data);
            setError(null);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.detail || 'Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        if (token) fetchData();
    }, [token, fetchData]);

    const handleAssetSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        const configData = {
            jeepColor,
            carnivoreDino,
            herbivoreDino,
            aviaryDino,
            aquaDino
        };

        try {
            await axios.put(`${API_URL}/assets/config`, configData, authHeaders);
            await fetchData();
            setSuccess('✅ Configuración guardada con éxito');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving config:', err);
            setError('❌ Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    const handleSendCampaign = async () => {
        if (!window.confirm("¿Estás seguro de que quieres enviar la campaña de email masivo a todos los usuarios?")) {
            return;
        }

        setSendingCampaign(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(
                `${API_URL}/admin/enviar-publicidad`,
                {},
                authHeaders
            );

            const count = response.data.destinatarios_count || 'N/A';
            setSuccess(`📧 ¡Campaña enviada con éxito a ${count} usuarios!`);
            setTimeout(() => setSuccess(''), 5000);
            fetchData();

        } catch (err) {
            console.error("Error al enviar campaña:", err);
            setError('❌ Error al enviar la campaña');
        } finally {
            setSendingCampaign(false);
        }
    };

    const stats = useMemo(() => ({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        totalCampaigns: logs.length,
        totalEmails: logs.reduce((sum, log) => sum + (log.destinatarios_count || 0), 0)
    }), [users, logs]);

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Cargando panel de administración...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-container">
            <div className="admin-dashboard">
                {/* Header */}
                <div className="admin-header">
                    <div className="header-content">
                        <h1>🦖 Panel de Administración</h1>
                        <p>Gestiona los activos y usuarios del parque</p>
                    </div>
                    <button className="exit-btn" onClick={onSalirClick}>
                        🚪 Salir
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>Total Usuarios</h3>
                            <span className="stat-number">{stats.totalUsers}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>Usuarios Activos</h3>
                            <span className="stat-number">{stats.activeUsers}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <h3>Campañas</h3>
                            <span className="stat-number">{stats.totalCampaigns}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📧</div>
                        <div className="stat-info">
                            <h3>Emails Enviados</h3>
                            <span className="stat-number">{stats.totalEmails}</span>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="message error-message">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="message success-message">
                        {success}
                    </div>
                )}

                {/* Asset Management */}
                <section className="assets-section">
                    <h2>🎨 Gestión de Activos</h2>
                    <div className="admin-grid">
                        {/* CARNÍVOROS */}
                        <div className="asset-selector">
                            <h3>🦖 Carnívoro</h3>
                            <img
                                src={getPreviewPath(carnivoreDino, carnivoreOptions)}
                                className="asset-preview"
                                alt={`Carnívoro ${carnivoreDino}`}
                            />
                            <button
                                onClick={() => setCarnivoreModalOpen(true)}
                                className="change-btn"
                            >
                                🔄 Cambiar
                            </button>
                        </div>

                        {/* HERBÍVOROS */}
                        <div className="asset-selector">
                            <h3>🌿 Herbívoro</h3>
                            <img
                                src={getPreviewPath(herbivoreDino, herbivoreOptions)}
                                className="asset-preview"
                                alt={`Herbívoro ${herbivoreDino}`}
                            />
                            <button
                                onClick={() => setHerbivoreModalOpen(true)}
                                className="change-btn"
                            >
                                🔄 Cambiar
                            </button>
                        </div>

                        {/* JEEP */}
                        <div className="asset-selector">
                            <h3>🚙 Jeep</h3>
                            <img
                                src={getPreviewPath(jeepColor, jeepOptions)}
                                className="asset-preview"
                                alt={`Jeep ${jeepColor}`}
                            />
                            <select
                                value={jeepColor}
                                onChange={e => setJeepColor(e.target.value)}
                                className="asset-select"
                            >
                                {jeepOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* AVIARIO */}
                        <div className="asset-selector">
                            <h3>🦅 Aviario</h3>
                            <img
                                src={previewPaths.volador}
                                className="asset-preview"
                                alt="Dinosaurio volador"
                            />
                            <div className="asset-info">Configuración fija</div>
                        </div>

                        {/* ACUARIO */}
                        <div className="asset-selector">
                            <h3>🐟 Acuario</h3>
                            <img
                                src={previewPaths.marino}
                                className="asset-preview"
                                alt="Dinosaurio marino"
                            />
                            <div className="asset-info">Configuración fija</div>
                        </div>
                    </div>

                    <button
                        className="save-assets-btn"
                        onClick={handleAssetSave}
                        disabled={saving}
                    >
                        {saving ? '💾 Guardando...' : '💾 Guardar Cambios'}
                    </button>
                </section>

                {/* Users Table */}
                <section className="data-section">
                    <h2>👥 Usuarios Registrados</h2>
                    <div className="table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Nombre</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td className="email-cell">{user.username}</td>
                                        <td>{user.nombre} {user.apellidos}</td>
                                        <td>
                                            <span className={`role-badge ${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                                {user.is_active ? '✅ Activo' : '❌ Inactivo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Marketing Section */}
                <section className="marketing-section">
                    <div className="marketing-header">
                        <h2>📢 Marketing</h2>
                        <button
                            className="email-campaign-btn"
                            onClick={handleSendCampaign}
                            disabled={sendingCampaign}
                        >
                            {sendingCampaign ? '📤 Enviando...' : '📧 Enviar Campaña Masiva'}
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Administrador</th>
                                    <th>Emails Enviados</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td>{log.admin_username}</td>
                                        <td>
                                            <span className="email-count">
                                                {log.destinatarios_count}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {logs.length === 0 && (
                            <div className="empty-state">
                                📭 No hay registros de campañas
                            </div>
                        )}
                    </div>
                </section>

                <AdminDinoSelectModal
                    isOpen={carnivoreModalOpen}
                    onClose={() => setCarnivoreModalOpen(false)}
                    onSelectDino={setCarnivoreDino}
                    dinoOptions={carnivoreOptions}
                    title="Seleccionar Carnívoro"
                />

                <AdminDinoSelectModal
                    isOpen={herbivoreModalOpen}
                    onClose={() => setHerbivoreModalOpen(false)}
                    onSelectDino={setHerbivoreDino}
                    dinoOptions={herbivoreOptions}
                    title="Seleccionar Herbívoro"
                />
            </div>
        </div>
    );
};

export default AdminDashboard;