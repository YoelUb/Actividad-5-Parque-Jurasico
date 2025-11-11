import React, { useState, useEffect, useCallback } from 'react';
import AdminDashboard from './componentes/AdminDashboard';
import Autenticacion from './componentes/Auth';
import Registro from './componentes/Registro';
import ForceChangePassword from './componentes/ForceChangePassword';
import VerificarEmail from './componentes/VerificarEmail';
import MapaJurassic from './componentes/MapaJurassic';
import ModalConfirmacion from './componentes/ModalConfirmacion';
import DinoModal from './componentes/DinoModal';
import LabModal from './componentes/LabModal';
import './App.css';

import IntroAnimacion from './componentes/IntroAnimacion';

const API_URL = 'http://localhost:8000/api';

function Aplicacion() {
    const [token, setToken] = useState(localStorage.getItem('jurassic_token'));
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);

    const [dinoSeleccionado, setDinoSeleccionado] = useState(null);
    const [dinos, setDinos] = useState({});

    const [labModalAbierto, setLabModalAbierto] = useState(false);
    const [labModalPhase, setLabModalPhase] = useState('helicopter');

    const [pantallaAuth, setPantallaAuth] = useState('login');
    const [tokenLimitado, setTokenLimitado] = useState(null);
    const [emailParaVerificar, setEmailParaVerificar] = useState(null);

    const [mostrandoIntro, setMostrandoIntro] = useState(true);

    const manejarCierreSesion = useCallback(() => {
        localStorage.removeItem('jurassic_token');
        setToken(null);
        setUsuarioActual(null);
        setDinos({});
        setPantallaAuth('login');
        setModalAbierto(false);
    }, []);

    const iniciarCierreSesion = () => {
        setModalAbierto(true);
    };

    useEffect(() => {
        if (!token || mostrandoIntro) {
            setCargando(false);
            return;
        }

        const obtenerDatosIniciales = async () => {
            setCargando(true);
            try {
                // NOTA: Esta lógica de fetch la he mantenido de tu App.js original
                const userRes = await fetch(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!userRes.ok) throw new Error('Token inválido');
                const datosUsuario = await userRes.json();
                setUsuarioActual(datosUsuario);

                const dinosRes = await fetch(`${API_URL}/parque/dinosaurios`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const allDinos = await dinosRes.json();
                const dinosById = allDinos.reduce((acc, dino) => {
                    acc[dino.id] = dino; // Asumiendo que 'id' existe; ajusta si es 'dino_id_str'
                    return acc;
                }, {});
                setDinos(dinosById);

            } catch (err) {
                console.error(err);
                manejarCierreSesion();
            } finally {
                setCargando(false);
            }
        };

        obtenerDatosIniciales();
    }, [token, mostrandoIntro, manejarCierreSesion]);

    const manejarLoginExitoso = (nuevoToken, mustChangePassword) => {
        if (mustChangePassword) {
            setTokenLimitado(nuevoToken);
            setPantallaAuth('forceChange');
        } else {
            localStorage.setItem('jurassic_token', nuevoToken);
            setToken(nuevoToken);
            setPantallaAuth('login');
        }
    };

    const handleDinoSelect = (dinoId) => {
        if (dinoId && dinos[dinoId]) {
            setDinoSeleccionado(dinos[dinoId]);
        }
    };

    const handleCloseDinoModal = () => {
        setDinoSeleccionado(null);
    };

    const handleHelipuertoClick = () => {
        setLabModalPhase('helicopter');
        setLabModalAbierto(true);
        setTimeout(() => {
            setLabModalPhase('lab');
        }, 2000);
    };

    const handleCloseLabModal = () => {
        setLabModalAbierto(false);
    };

    const irARegistro = () => setPantallaAuth('register');

    const irALogin = () => {
        setPantallaAuth('login');
        setTokenLimitado(null);
        setEmailParaVerificar(null);
    };

    const irAForceChange = (tokenForzado) => {
        setTokenLimitado(tokenForzado);
        setPantallaAuth('forceChange');
    };

    const irAVerificar = (email) => {
        setEmailParaVerificar(email);
        setPantallaAuth('verifyEmail');
    };

    const handleEmpezar = () => {
        setMostrandoIntro(false);
    };

    const renderizarContenido = () => {

        if (mostrandoIntro) {
            return <IntroAnimacion onEmpezar={handleEmpezar} />;
        }

        if (cargando && token) {
            return <h1>Cargando...</h1>;
        }

        if (!token) {
            if (pantallaAuth === 'login') {
                return <Autenticacion
                    enLoginExitoso={manejarLoginExitoso}
                    onNavigateToRegister={irARegistro}
                    onForceChangePassword={irAForceChange}
                />;
            }
            if (pantallaAuth === 'register') {
                return <Registro
                    onRegistroExitoso={irAVerificar}
                />;
            }
            if (pantallaAuth === 'forceChange') {
                return <ForceChangePassword
                    token={tokenLimitado}
                    onPasswordChanged={irALogin}
                />
            }
            if (pantallaAuth === 'verifyEmail') {
                return <VerificarEmail
                    email={emailParaVerificar}
                    onVerificationSuccess={irALogin}
                />
            }
        }

        if (usuarioActual?.role === 'admin') {
            return (
                <AdminDashboard token={token} onSalirClick={iniciarCierreSesion} />
            );
        }

        return (
            <MapaJurassic
                onSalirClick={iniciarCierreSesion}
                onDinoSelect={handleDinoSelect}
                onHelipuertoClick={handleHelipuertoClick}
                token={token}
            />
        );
    };

    return (
        <div className="App">
            <header className={mostrandoIntro ? "App-header intro-active" : "App-header"}>
                {renderizarContenido()}
            </header>

            <ModalConfirmacion
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                onConfirm={manejarCierreSesion}
                message="¿Quieres abandonar el parque?"
            />

            <DinoModal
                dino={dinoSeleccionado}
                onClose={handleCloseDinoModal}
            />

            <LabModal
                isOpen={labModalAbierto}
                phase={labModalPhase}
                onClose={handleCloseLabModal}
            />
        </div>
    );
}

export default Aplicacion;