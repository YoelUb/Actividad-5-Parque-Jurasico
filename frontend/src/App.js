import React, {useState, useEffect, useCallback, useRef} from 'react';
import {Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import AdminDashboard from './componentes/AdminDashboard';
import Autenticacion from './componentes/Auth';
import Registro from './componentes/Registro';
import ForceChangePassword from './componentes/ForceChangePassword';
import VerificarEmail from './componentes/VerificarEmail';
import MapaJurassic from './componentes/MapaJurassic';
import ModalConfirmacion from './componentes/ModalConfirmacion';
import DinoModal from './componentes/DinoModal';
import LabModal from './componentes/LabModal';
import JeepModal from './componentes/JeepModal';
import GuardasModal from './componentes/GuardasModal';
import IntroAnimacion from './componentes/IntroAnimacion';
import SolicitarReset from './componentes/RequestPasswordReset';
import EjecutarReset from './componentes/ResetPassword';
import './App.css';

import {LOCATIONS} from './componentes/config/locations';

const API_URL = 'http://localhost:8000/api';

function Aplicacion() {
    const [token, setToken] = useState(localStorage.getItem('jurassic_token'));
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [dinoSeleccionado, setDinoSeleccionado] = useState(null);
    const [dinos, setDinos] = useState([]);
    const [assetConfig, setAssetConfig] = useState(null);
    const [labModalAbierto, setLabModalAbierto] = useState(false);
    const [labModalPhase, setLabModalPhase] = useState('helicopter');
    const [jeepModalAbierto, setJeepModalAbierto] = useState(false);
    const [jeepModalPhase, setJeepModalPhase] = useState('lista');
    const [guardasModalAbierto, setGuardasModalAbierto] = useState(false);

    const [mostrandoIntro, setMostrandoIntro] = useState(() => {
        return sessionStorage.getItem('haVistoIntro') === null;
    });

    const helicopterAudioRef = useRef(null);
    const jeepAudioRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        helicopterAudioRef.current = new Audio('/helicoptero.mp3');
        helicopterAudioRef.current.preload = 'auto';
        helicopterAudioRef.current.loop = true;

        jeepAudioRef.current = new Audio('/jeep.mp3');
        jeepAudioRef.current.preload = 'auto';
        jeepAudioRef.current.loop = true;
    }, []);

    const manejarCierreSesion = useCallback(() => {
        setToken(null);
        setUsuarioActual(null);
        setAssetConfig(null);
        localStorage.removeItem('jurassic_token');
        setModalAbierto(false);
        setDinoSeleccionado(null);
        setLabModalAbierto(false);
        setJeepModalAbierto(false);
        setGuardasModalAbierto(false);
        navigate('/login');
    }, [navigate]);

    const iniciarCierreSesion = () => {
        setModalAbierto(true);
    };

    const obtenerDatosIniciales = useCallback(async () => {
        if (!token) {
            setCargando(false);
            return;
        }

        try {
            setCargando(true);

            const userRes = await fetch(`${API_URL}/auth/me`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            if (!userRes.ok) throw new Error('Token inválido');
            const datosUsuario = await userRes.json();
            setUsuarioActual(datosUsuario);

            const assetsRes = await fetch(`${API_URL}/assets/config`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            if (assetsRes.ok) {
                const configData = await assetsRes.json();
                setAssetConfig(configData);
            }

            const dinosRes = await fetch(`${API_URL}/parque/dinosaurios`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            if (dinosRes.ok) {
                const allDinos = await dinosRes.json();
                setDinos(allDinos);
            }

        } catch (err) {
            console.error('Error cargando datos:', err);
            setToken(null);
            localStorage.removeItem('jurassic_token');
            navigate('/login');
        } finally {
            setCargando(false);
        }
    }, [token, navigate]);

    useEffect(() => {
        obtenerDatosIniciales();
    }, [token, obtenerDatosIniciales]);

    const manejarLoginExitoso = (nuevoToken) => {
        setToken(nuevoToken);
        localStorage.setItem('jurassic_token', nuevoToken);
    };

    const handleDinoSelect = (dinoId) => {
        if (dinoId && dinos.length > 0) {
            const dino = dinos.find(d => d.dino_id_str === dinoId);
            if (dino) {
                setDinoSeleccionado(dino);
            }
        }
    };

    const handleCloseDinoModal = () => {
        setDinoSeleccionado(null);
    };

    const handleHelipuertoClick = () => {
        helicopterAudioRef.current.currentTime = 0;
        helicopterAudioRef.current.play().catch(e => console.error("Audio play failed:", e));

        setLabModalPhase('helicopter');
        setLabModalAbierto(true);

        setTimeout(() => {
            setLabModalPhase('lab');
            helicopterAudioRef.current.pause();
        }, 4000);
    };

    const handleCloseLabModal = () => {
        helicopterAudioRef.current.pause();
        setLabModalAbierto(false);
    };

    const handleCocheClick = () => {
        setJeepModalPhase('lista');
        setJeepModalAbierto(true);
    };

    const handleJeepRedirect = (location) => {
        jeepAudioRef.current.currentTime = 0;
        jeepAudioRef.current.play().catch(e => console.error("Audio play failed:", e));

        setJeepModalPhase('viaje');

        setTimeout(() => {
            jeepAudioRef.current.pause();
            setJeepModalAbierto(false);

            if (location.dinoId) {
                handleDinoSelect(location.dinoId);
            } else if (location.name === 'Helipuerto') {
                handleHelipuertoClick();
            } else if (location.name === 'Puerta') {
                iniciarCierreSesion();
            } else if (location.name === "Guardas") {
                handleGuardasClick();
            }
        }, 4000);
    };

    const handleCloseJeepModal = () => {
        jeepAudioRef.current.pause();
        setJeepModalAbierto(false);
    };

    const handleGuardasClick = () => {
        setGuardasModalAbierto(true);
    };

    const handleCloseGuardasModal = () => {
        setGuardasModalAbierto(false);
    };

    const handleIntroTerminada = () => {
        setMostrandoIntro(false);
        sessionStorage.setItem('haVistoIntro', 'true');
    };

    const renderizarContenido = () => {
        if (cargando) {
            return <h1>Cargando...</h1>;
        }

        if (mostrandoIntro) {
            return <IntroAnimacion onEmpezar={handleIntroTerminada}/>;
        }

        const homePath = token ? (usuarioActual?.role === 'admin' ? '/admin' : '/mapa') : '/login';

        return (
            <Routes>
                <Route path="/login" element={
                    !token ? (
                        <Autenticacion enLoginExitoso={manejarLoginExitoso}/>
                    ) : (
                        <Navigate to={homePath} replace/>
                    )
                }/>

                <Route path="/registro" element={
                    !token ? <Registro/> : <Navigate to={homePath} replace/>
                }/>

                <Route path="/verificar-email" element={
                    !token ? <VerificarEmail/> : <Navigate to={homePath} replace/>
                }/>

                <Route path="/force-change-password" element={
                    !token ? <ForceChangePassword/> : <Navigate to={homePath} replace/>
                }/>

                <Route path="/solicitar-reset" element={
                    !token ? <SolicitarReset/> : <Navigate to={homePath} replace/>
                }/>

                <Route path="/reset-password" element={
                    !token ? <EjecutarReset/> : <Navigate to={homePath} replace/>
                }/>

                <Route path="/admin" element={
                    token && usuarioActual?.role === 'admin' ? (
                        <AdminDashboard onSalirClick={iniciarCierreSesion}/>
                    ) : (
                        <Navigate to={token ? homePath : "/login"} replace/>
                    )
                }/>

                <Route path="/mapa" element={
                    token ? (
                        usuarioActual?.role !== 'admin' ? (
                            <MapaJurassic
                                onSalirClick={iniciarCierreSesion}
                                onDinoSelect={handleDinoSelect}
                                onHelipuertoClick={handleHelipuertoClick}
                                onCocheClick={handleCocheClick}
                                onGuardasClick={handleGuardasClick}
                                assetConfig={assetConfig}
                                dinos={dinos}
                            />
                        ) : (
                            <Navigate to="/admin" replace/>
                        )
                    ) : (
                        <Navigate to="/login" replace/>
                    )
                }/>

                <Route path="*" element={
                    <Navigate to={homePath} replace/>
                }/>
            </Routes>
        );
    };

    return (
        <div className="App">
            <header className="App-header">{renderizarContenido()}</header>

            <ModalConfirmacion
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                onConfirm={manejarCierreSesion}
                message="¿Quieres abandonar el parque?"
                confirmText="Sí, abandonar"
                cancelText="Quedarse"
            />

            <DinoModal dino={dinoSeleccionado} onClose={handleCloseDinoModal}/>

            <LabModal
                isOpen={labModalAbierto}
                phase={labModalPhase}
                onClose={handleCloseLabModal}
            />

            <JeepModal
                isOpen={jeepModalAbierto}
                onClose={handleCloseJeepModal}
                phase={jeepModalPhase}
                locations={LOCATIONS}
                onSelectLocation={handleJeepRedirect}
                jeepColor={assetConfig?.jeepColor || 'Green'}
            />

            <GuardasModal
                isOpen={guardasModalAbierto}
                onClose={handleCloseGuardasModal}
            />
        </div>
    );
}

export default Aplicacion;