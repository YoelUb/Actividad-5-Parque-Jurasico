import React, { useState, useEffect, useCallback } from 'react';
import AdminDashboard from './componentes/AdminDashboard';
import Autenticacion from './componentes/Auth';
import './App.css';

const API_URL = 'http://localhost:8000/api';

function Aplicacion() {
  const [token, setToken] = useState(localStorage.getItem('jurassic_token'));
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [dinoSeleccionado, setDinoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);

  const manejarCierreSesion = useCallback(() => {
    setToken(null);
    setUsuarioActual(null);
    localStorage.removeItem('jurassic_token');
  }, []);

  useEffect(() => {
    if (!token) {
      setCargando(false);
      return;
    }

    const obtenerUsuario = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!respuesta.ok) throw new Error('Token inválido');
        const datosUsuario = await respuesta.json();
        setUsuarioActual(datosUsuario);
      } catch (err) {
        manejarCierreSesion();
      } finally {
        setCargando(false);
      }
    };

    obtenerUsuario();
  }, [token, manejarCierreSesion]);

  const manejarLoginExitoso = (nuevoToken) => {
    setToken(nuevoToken);
    localStorage.setItem('jurassic_token', nuevoToken);
  };

  const manejarClickRecinto = async (idDinosaurio) => {
    if (!idDinosaurio) return;

    try {
      const respuesta = await fetch(`${API_URL}/v1/parque/dinosaurio/${idDinosaurio}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!respuesta.ok) throw new Error('Dinosaurio no encontrado');
      const datos = await respuesta.json();
      setDinoSeleccionado(datos);
    } catch (err) {
      console.error(err);
    }
  };

  const cerrarModal = () => {
    setDinoSeleccionado(null);
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
        <>
          <button onClick={manejarCierreSesion} className="logout-button">
            Salir
          </button>
          <AdminDashboard token={token} />
        </>
      );
    }

    return (
      <>
        <button onClick={manejarCierreSesion} className="logout-button">
          Salir
        </button>
        <Parque enClickRecinto={manejarClickRecinto} token={token} />
        {dinoSeleccionado && (
          <ModalDino dinosaurio={dinoSeleccionado} alCerrar={cerrarModal} />
        )}
      </>
    );
  };

  return (
    <div className="App">
      <header className="App-header">{renderizarContenido()}</header>
    </div>
  );
}

export default Aplicacion;
