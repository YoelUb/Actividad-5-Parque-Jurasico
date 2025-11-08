import React, {useState, useEffect, useCallback} from 'react';
import AdminDashboard from './componentes/AdminDashboard';
import Autenticacion from './componentes/Auth';
import MapaJurassic from './componentes/MapaJurassic';
import ModalConfirmacion from './componentes/ModalConfirmacion';
import './App.css';

const API_URL = 'http://localhost:8000/api';

function Aplicacion() {
    const [token, setToken] = useState(localStorage.getItem('jurassic_token'));
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [dinoSeleccionado, setDinoSeleccionado] = useState(null);
    const [cargando, setCargando] = useState(true);

    // 2. Añadir estado para el modal
    const [modalAbierto, setModalAbierto] = useState(false);

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

        const obtenerUsuario = async () => {
            try {
                const respuesta = await fetch(`${API_URL}/auth/me`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                if (!respuesta.ok) throw new Error('Token inválido');
                const datosUsuario = await respuesta.json();
                setUsuarioActual(datosUsuario);
            } catch (err) {
                setToken(null);
                localStorage.removeItem('jurassic_token');
            } finally {
                setCargando(false);
            }
        };

        obtenerUsuario();
    }, [token]);

    const manejarLoginExitoso = (nuevoToken) => {
        setToken(nuevoToken);
        localStorage.setItem('jurassic_token', nuevoToken);
    };

    // Esta función ya no es necesaria aquí, la pasaremos al mapa
    // const manejarClickRecinto = async (idDinosaurio) => { ... };

    // const cerrarModal = () => { ... }; // Esta función tampoco

    const renderizarContenido = () => {
        if (cargando) {
            return <h1>Cargando...</h1>;
        }

        if (!token) {
            return <Autenticacion enLoginExitoso={manejarLoginExitoso}/>;
        }

        if (usuarioActual?.role === 'admin') {
            return (
                <>
                    <AdminDashboard token={token} onSalirClick={iniciarCierreSesion}/>
                </>
            );
        }

        return (
            <>
                <MapaJurassic onSalirClick={iniciarCierreSesion}/>
            </>
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
        </div>
    );
}

export default Aplicacion;