// frontend/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import AdminDashboard from './componentes/AdminDashboard';
import Autenticacion from './componentes/Auth';
import MapaJurassic from './componentes/MapaJurassic';
import ModalConfirmacion from './componentes/ModalConfirmacion';
import DinoModal from './componentes/DinoModal';
import LabModal from './componentes/LabModal';
import './App.css';

const API_URL = 'http://localhost:8000/api';

function Aplicacion() {
    const [token, setToken] = useState(localStorage.getItem('jurassic_token'));
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);

    const [dinoSeleccionado, setDinoSeleccionado] = useState(null);
    const [dinos, setDinos] = useState({});

    const [labModalAbierto, setLabModalAbierto] = useState(false);
    const [labModalPhase, setLabModalPhase] = useState('helicopter'); // 'helicopter' o 'lab'

    const manejarCierreSesion = useCallback(() => {
        setToken(null);
        setUsuarioActual(null);
        localStorage.removeItem('jurassic_token');
        setModalAbierto(false);
    }, []);

    const iniciarCierreSesion = () => {
        setModalAbierto(true);
    };

    useEffect(() => {
        if (!token) {
            setCargando(false);
            return;
        }

        const obtenerDatosIniciales = async () => {
            try {
                // 1. Obtener usuario
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
                    acc[dino.id] = dino;
                    return acc;
                }, {});
                setDinos(dinosById);

            } catch (err) {
                console.error(err);
                setToken(null);
                localStorage.removeItem('jurassic_token');
            } finally {
                setCargando(false);
            }
        };

        obtenerDatosIniciales();
    }, [token]);

    const manejarLoginExitoso = (nuevoToken) => {
        setToken(nuevoToken);
        localStorage.setItem('jurassic_token', nuevoToken);
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
        }, 2000); // 2000 ms = 2 segundos
    };

    const handleCloseLabModal = () => {
        setLabModalAbierto(false);
    };


    const renderizarContenido = () => {
        if (cargando) {
            return <h1>Cargando...</h1>;
        }

        if (!token) {
            return <Autenticacion enLoginExitoso={manejarLoginExitoso} />;
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
                onHelipuertoClick={handleHelipuertoClick} // <-- 4. PASAR EL MANEJADOR
                token={token}
            />
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