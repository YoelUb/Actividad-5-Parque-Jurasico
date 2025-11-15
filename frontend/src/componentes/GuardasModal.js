import React, { useState } from 'react';
import SpriteAnimator from './SpriteAnimator';
import './GuardasModal.css';

const personajesData = {
  cazador: {
    idle: {
      base: '/Guardas/Cazador/idle/cazador',
      frames: 7, 
    },
    especial: {
      base: '/Guardas/Cazador/muestreo/cazador',
      frames: 16,
    },
    nombre: 'Cazador'
  },
  cuidadora: {
    idle: {
      base: '/Guardas/Cuidadora/idle/cuidadora',
      frames: 6,
    },
    especial: {
      base: '/Guardas/Cuidadora/saludo/cuidadora',
      frames: 18,
    },
    nombre: 'Cuidadora'
  }
};

const GuardasModal = ({ isOpen, onClose }) => {
  const [personaje, setPersonaje] = useState('cazador');
  const [animacion, setAnimacion] = useState('idle');

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    setPersonaje('cazador');
    setAnimacion('idle');
    onClose();
  };

  const animData = personajesData[personaje][animacion];
  const nombrePersonaje = personajesData[personaje].nombre;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content guardas-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={handleClose}>×</button>

        <h2>Cabaña de Guardas</h2>
        <p>Selecciona un guarda para ver su estado.</p>

        <div className="personaje-selector">
          <button
            onClick={() => { setPersonaje('cazador'); setAnimacion('idle'); }}
            className={`personaje-button ${personaje === 'cazador' ? 'active' : ''}`}
          >
            Cazador
          </button>
          <button
            onClick={() => { setPersonaje('cuidadora'); setAnimacion('idle'); }}
            className={`personaje-button ${personaje === 'cuidadora' ? 'active' : ''}`}
          >
            Cuidadora
          </button>
        </div>

        <div className="anim-container">
          <SpriteAnimator
            basePath={animData.base}
            frameCount={animData.frames}
            fps={10}
            scale={3}
          />
        </div>

        <div className="anim-controls">
          <p>Controlar animación de: <strong>{nombrePersonaje}</strong></p>
          <button
            onClick={() => setAnimacion('idle')}
            className={`anim-button ${animacion === 'idle' ? 'active' : ''}`}
          >
            Idle
          </button>
          <button
            onClick={() => setAnimacion('especial')}
            className={`anim-button ${animacion === 'especial' ? 'active' : ''}`}
          >
            Acción Especial
          </button>
        </div>

      </div>
    </div>
  );
};

export default GuardasModal;