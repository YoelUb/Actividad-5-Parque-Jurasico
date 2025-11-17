/* Comentario Version anterior*/
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


    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);


    const token = localStorage.getItem('jurassic_token');

    const authHeaders = useMemo(
        () => ({headers: {Authorization: `Bearer ${token}`}}),
        [token]
    );

    const fetchData = useCallback(async () => {
        try {
            const [usersRes, logsRes, assetsRes] = await Promise.all([
                axios.get(`${API_URL}/admin/users/`, authHeaders),
                axios.get(`${API_URL}/admin/logs/marketing`, authHeaders),
                axios.get(`${API_URL}/assets/config`, authHeaders)
            ]);

            const cfg = assetsRes.data;
            setJeepColor(cfg.jeepColor);
            setCarnivoreDino(cfg.carnivoreDino);
            setHerbivoreDino(cfg.herbivoreDino);

            setUsers(usersRes.data);
            setLogs(logsRes.data);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);
    useEffect(() => {
        if (token) fetchData();
    }, [token, fetchData]);

    const handleAssetSave = async () => {
        const configData = {
            jeepColor,
            carnivoreDino,
            herbivoreDino,
            aviaryDino,
            aquaDino
        };

        try {
            await axios.put(`${API_URL}/assets/config`, configData, authHeaders);
            alert("Configuración guardada con éxito.");
        } catch (err) {
            console.error(err);
            alert("Error al guardar configuración.");
        }
    };

    if (loading) return <div className="admin-loading">Cargando...</div>;

    return (
        <div className="admin-dashboard">

            <div className="admin-header">
                <h2>Panel de Administración</h2>
                <button onClick={onSalirClick}>Salir</button>
            </div>

            <div className="admin-grid">

                {/* CARNÍVOROS */}
                <div className="asset-selector">
                    <h3>Carnívoro</h3>
                    <img
                        src={getPreviewPath(carnivoreDino, carnivoreOptions)}
                        className="asset-preview"
                        alt={`Carnívoro ${carnivoreDino}`}
                    />
                    <button onClick={() => setCarnivoreModalOpen(true)}>Cambiar</button>
                </div>

                {/* HERBÍVOROS */}
                <div className="asset-selector">
                    <h3>Herbívoro</h3>
                    <img
                        src={getPreviewPath(herbivoreDino, herbivoreOptions)}
                        className="asset-preview"
                        alt={`Herbívoro ${herbivoreDino}`}
                    />
                    <button onClick={() => setHerbivoreModalOpen(true)}>Cambiar</button>
                </div>

                {/* JEEP */}
                <div className="asset-selector">
                    <h3>Jeep</h3>
                    <img
                        src={getPreviewPath(jeepColor, jeepOptions)}
                        className="asset-preview"
                        alt={`Jeep ${jeepColor}`}
                    />
                    <select value={jeepColor} onChange={e => setJeepColor(e.target.value)}>
                        {jeepOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* AVIARIO */}
                <div className="asset-selector">
                    <h3>Aviario</h3>
                    <img
                        src={previewPaths.volador}
                        className="asset-preview"
                        alt="Dinosaurio volador"
                    />
                </div>

                {/* ACUARIO */}
                <div className="asset-selector">
                    <h3>Acuario</h3>
                    <img
                        src={previewPaths.marino}
                        className="asset-preview"
                        alt="Dinosaurio marino"
                    />
                </div>

                <button className="save-assets-btn" onClick={handleAssetSave}>
                    Guardar Cambios
                </button>
            </div>
            <div className="admin-data-section">
                {error && <div className="admin-error">Error: {error}</div>}

                <div className="admin-data-list">
                    <h2>Usuarios Registrados</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username (Email)</th>
                            <th>Nombre</th>
                            <th>Rol</th>
                            <th>Activo</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.nombre} {user.apellidos}</td>
                                <td>{user.role}</td>
                                <td>{user.is_active ? 'Sí' : 'No'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="admin-data-list">
                    <h2>Logs de Marketing</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Admin</th>
                            <th>Emails Enviados</th>
                        </tr>
                        </thead>
                        <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                {/* El backend envía el timestamp */}
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                                <td>{log.admin_username}</td>
                                <td>{log.destinatarios_count}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modales */}
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
    );
};

export default AdminDashboard;