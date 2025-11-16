import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import './App.css';

const API_URL = 'http://localhost:8000/api';

const locations = [
    {"name": "Recinto Carnívoros", "x": 236, "y": 290, "r": 8, "dinoId": "dino_001"},
    {"name": "Recinto Herbívoros", "x": 334, "y": 374, "r": 8, "dinoId": "dino_004"},
    {"name": "Recinto Aviario", "x": 500, "y": 438, "r": 8, "dinoId": "dino_003"},
    {"name": "Puerta", "x": 857, "y": 620, "r": 8},
    {"name": "Coche", "x": 608, "y": 658, "r": 8},
    {"name": "Recinto Acuario", "x": 862, "y": 159, "r": 8, "dinoId": "dino_002"},
    {"name": "Guardas", "x": 484, "y": 336, "r": 8},
    {"name": "Helipuerto", "x": 575, "y": 175, "r": 8},
];

function Aplicacion() {
  const [token, setToken] = useState(localStorage.getItem('jurassic_token'));
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [dinoSeleccionado, setDinoSeleccionado] = useState(null);
  const [dinos, setDinos] = useState({});
  const [labModalAbierto, setLabModalAbierto] = useState(false);
  const [labModalPhase, setLabModalPhase] = useState('helicopter');
  const [jeepModalAbierto, setJeepModalAbierto] = useState(false);
  const [jeepModalPhase, setJeepModalPhase] = useState('lista');
  const [guardasModalAbierto, setGuardasModalAbierto] = useState(false);
  const [pantallaAuth, setPantallaAuth] = useState('login');
  const [tokenLimitado, setTokenLimitado] = useState(null);
  const [emailParaVerificar, setEmailParaVerificar] = useState(null);

  // CAMBIO AQUÍ → usar sessionStorage en lugar de localStorage
  const [mostrandoIntro, setMostrandoIntro] = useState(() => {
    return sessionStorage.getItem('haVistoIntro') === null;
  });

  const helicopterAudioRef = useRef(null);
  const jeepAudioRef = useRef(null);

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
    localStorage.removeItem('jurassic_token');
    setModalAbierto(false);
    setPantallaAuth('login');
    setEmailParaVerificar(null);
    setTokenLimitado(null);
    setDinoSeleccionado(null);
    setLabModalAbierto(false);
    setJeepModalAbierto(false);
    setGuardasModalAbierto(false);
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
          acc[dino.dino_id_str] = dino;
          return acc;
        }, {});
        setDinos(dinosById);
      } catch {
        setToken(null);
        localStorage.removeItem('jurassic_token');
        setPantallaAuth('login');
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

  const renderizarContenido = () => {
    if (cargando) {
      return <h1>Cargando...</h1>;
    }

    if (mostrandoIntro) {
      return <IntroAnimacion onEmpezar={handleIntroTerminada} />;
    }

    if (!token) {
      if (pantallaAuth === 'login') {
        return (
          <Autenticacion
            enLoginExitoso={manejarLoginExitoso}
            onNavigateToRegister={irARegistro}
            onForceChangePassword={irAForceChange}
          />
        );
      }
      if (pantallaAuth === 'register') {
        return <Registro onRegistroExitoso={irAVerificar} />;
      }
      if (pantallaAuth === 'forceChange') {
        return (
          <ForceChangePassword
            token={tokenLimitado}
            onPasswordChanged={irALogin}
          />
        );
      }
      if (pantallaAuth === 'verifyEmail') {
        return (
          <VerificarEmail
            email={emailParaVerificar}
            onVerificationSuccess={irALogin}
          />
        );
      }
    }

    if (usuarioActual?.role?.toLowerCase() === 'admin') {
      return <AdminDashboard token={token} onSalirClick={iniciarCierreSesion} />;
    }

    return (
      <MapaJurassic
        onSalirClick={iniciarCierreSesion}
        onDinoSelect={handleDinoSelect}
        onHelipuertoClick={handleHelipuertoClick}
        onCocheClick={handleCocheClick}
        onGuardasClick={handleGuardasClick}
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
        confirmText="Sí, abandonar"
        cancelText="Quedarse"
      />

      <DinoModal dino={dinoSeleccionado} onClose={handleCloseDinoModal} />

      <LabModal
        isOpen={labModalAbierto}
        phase={labModalPhase}
        onClose={handleCloseLabModal}
      />

      <JeepModal
        isOpen={jeepModalAbierto}
        onClose={handleCloseJeepModal}
        phase={jeepModalPhase}
        locations={locations}
        onSelectLocation={handleJeepRedirect}
      />

      <GuardasModal
        isOpen={guardasModalAbierto}
        onClose={handleCloseGuardasModal}
      />
    </div>
  );
}

export default Aplicacion;
