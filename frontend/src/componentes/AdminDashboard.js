import React, {useState, useEffect, useMemo} from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import ModalConfirmacion from './ModalConfirmacion';
import AdminDinoSelectModal from './AdminDinoSelectModal';

const API_URL = 'http://localhost:8000/api';

const carnivoreOptions = [
    {
        value: 'RedDino',
        label: 'T-Rex (Rojo)',
        path: '/RedDino/RedDinosaur',
        frameCount: 18,
        fps: 10,
        previewPath: '/RedDino/RedDinosaur1.png',
        info: 'El Tyrannosaurus Rex, con su distintiva coloración roja, es la atracción principal.'
    },
    {
        value: 'BlueDino',
        label: 'T-Rex (Azul)',
        path: '/BlueDino/BlueDinosaur',
        frameCount: 18,
        fps: 10,
        previewPath: '/BlueDino/BlueDinosaur1.png',
        info: 'Una variante genética de T-Rex, resultado de la experimentación. Su color azul lo hace único.'
    },
    {
        value: 'YellowDino',
        label: 'T-Rex (Amarillo)',
        path: '/yellowDino/YellowDinosaur',
        frameCount: 18,
        fps: 10,
        previewPath: '/yellowDino/YellowDinosaur1.png',
        info: 'Adaptado para camuflaje en zonas más áridas, esta variante amarilla es igual de imponente.'
    },
    {
        value: 'DarkGreenDino',
        label: 'T-Rex (Verde Oscuro)',
        path: '/DarkGreenDino/DarkGreenDinosaur',
        frameCount: 18,
        fps: 10,
        previewPath: '/DarkGreenDino/DarkGreenDinosaur1.png',
        info: 'Una variante adaptada al camuflaje de jungla densa. Más difícil de ver, pero igual de letal.'
    },
    {
        value: 'liteGreenDino',
        label: 'T-Rex (Verde claro)',
        path: '/liteGreenDino/LightGreenDinosaur',
        frameCount: 18,
        fps: 10,
        previewPath: '/liteGreenDino/LightGreenDinosaur1.png',
        info: 'Una mutación más joven y ágil, su coloración clara le permite cazar en praderas abiertas.'
    },
    {
        value: 'Dino_Especial',
        label: 'Spinosaurus',
        path: '/Dino_Especial/idle/Spino',
        frameCount: 9,
        fps: 8,
        previewPath: '/Dino_Especial/idle/Spino.png',
        info: 'Un temible depredador semi-acuático con animaciones "idle" y "walk".'
    }
];

const herbivoreOptions = [
    {
        value: 'broncosaurio_azul',
        label: 'Brontosaurus (Azul)',
        path: '/broncosaurio_azul/idle/broncosaurio',
        frameCount: 12,
        fps: 6,
        previewPath: '/broncosaurio_azul/idle/broncosaurio1.png',
        info: 'Un gentil gigante para acompañar a los Triceratops.'
    },
    {
        value: 'none',
        label: 'Ninguno (Solo Triceratops)',
        path: '',
        frameCount: 0,
        fps: 0,
        previewPath: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        info: 'Solo se mostrarán los Triceratops en el recinto.'
    }
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
    },
];

const triceratopsPreview = {
    value: 'triceratops',
    previewPath: '/triceraptors/triceraptors1.png',
    frameCount: 4,
    fps: 4
};
const aviaryPreview = {
    value: 'volador',
    previewPath: '/volador/volador1.png',
    frameCount: 12,
    fps: 10
};
const aquaPreview = {
    value: 'marino',
    previewPath: '/marino/marino1.png',
    frameCount: 2,
    fps: 2
};

const getPreviewPath = (value) => {
    if (value === 'none') {
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }

    const allOptions = [
        ...jeepOptions,
        ...carnivoreOptions,
        ...herbivoreOptions,
        triceratopsPreview,
        aviaryPreview,
        aquaPreview
    ];

    const selected = allOptions.find(opt => opt.value === value);
    return selected ? selected.previewPath : '';
};

const AdminDashboard = ({onSalirClick}) => {
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const [promoModalAbierto, setPromoModalAbierto] = useState(false);
    const [carnivoreModalOpen, setCarnivoreModalOpen] = useState(false);
    const [herbivoreModalOpen, setHerbivoreModalOpen] = useState(false);

    const [emailStatus, setEmailStatus] = useState({
        loading: false,
        message: '',
        error: false,
    });

    const [jeepColor, setJeepColor] = useState('Green');
    const [carnivoreDino, setCarnivoreDino] = useState('RedDino');
    const [herbivoreDino, setHerbivoreDino] = useState('triceratops');
    const [herbivoreDinoSecundario, setHerbivoreDinoSecundario] = useState('broncosaurio_azul');
    const [aviaryDino, setAviaryDino] = useState('volador');
    const [aquaDino, setAquaDino] = useState('marino');

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

                setJeepColor(config.jeepColor || 'Green');
                setCarnivoreDino(config.carnivoreDino || 'RedDino');
                setHerbivoreDino('triceratops');
                setHerbivoreDinoSecundario(config.herbivoreDinoSecundario || 'broncosaurio_azul');
                setAviaryDino('volador');
                setAquaDino('marino');

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
        setCarnivoreModalOpen(false);
    };

    const handleSelectHerbivoreDino = (dinoValue) => {
        setHerbivoreDinoSecundario(dinoValue);
        setHerbivoreModalOpen(false);
    };

    const handleAssetSave = async () => {
        setSaveStatus({ loading: true, message: '', error: false });

        const configData = {
            jeepColor: jeepColor,
            carnivoreDino: carnivoreDino,
            herbivoreDino: herbivoreDino,
            herbivoreDinoSecundario: herbivoreDinoSecundario,
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
                                <img src={getPreviewPath(jeepColor)} alt="Jeep" className="asset-preview" />
                                <select value={jeepColor} onChange={(e) => setJeepColor(e.target.value)}>
                                    {jeepOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="asset-selector">
                                <label>Recinto Carnívoros</label>
                                <img src={getPreviewPath(carnivoreDino)} alt="Dino Carnívoro" className="asset-preview" />
                                <button
                                    className="change-asset-btn"
                                    onClick={() => setCarnivoreModalOpen(true)}
                                >
                                    Cambiar Dinosaurio
                                </button>
                            </div>

                            <div className="asset-selector">
                                <label>Recinto Herbívoros</label>
                                <div className="asset-preview-stacked">
                                    <img src={getPreviewPath('triceratops')} alt="Triceratops" className="asset-preview" title="Triceratops (Fijo)" />
                                    <img src={getPreviewPath(herbivoreDinoSecundario)} alt="Dino Herbívoro 2" className="asset-preview" title={herbivoreDinoSecundario === 'none' ? 'Ninguno' : 'Brontosaurus'} />
                                </div>
                                <button
                                    className="change-asset-btn"
                                    onClick={() => setHerbivoreModalOpen(true)}
                                >
                                    Cambiar 2º Dino
                                </button>
                            </div>

                            <div className="asset-selector">
                                <label>Recinto Aviario</label>
                                <img src={getPreviewPath('volador')} alt="Dino Aviario" className="asset-preview" />
                                <span className="asset-name-static">Pteranodon (Fijo)</span>
                            </div>

                            <div className="asset-selector">
                                <label>Recinto Acuario</label>
                                <img src={getPreviewPath('marino')} alt="Dino Acuario" className="asset-preview" />
                                <span className="asset-name-static">Mosasaurus (Fijo)</span>
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
              isOpen={carnivoreModalOpen}
              onClose={() => setCarnivoreModalOpen(false)}
              onSelectDino={handleSelectCarnivoreDino}
              dinoOptions={carnivoreOptions}
              title="Seleccionar Carnívoro"
              description="Elige la especie que se mostrará en el recinto de carnívoros."
            />

            <AdminDinoSelectModal
              isOpen={herbivoreModalOpen}
              onClose={() => setHerbivoreModalOpen(false)}
              onSelectDino={handleSelectHerbivoreDino}
              dinoOptions={herbivoreOptions}
              title={"Seleccionar Hervívoro"}
              description={"Elige a la especie que se mostrará en el recinto de hervívoros"}
            />
        </div>
    );
};

export default AdminDashboard;