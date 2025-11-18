import React, { useState, useRef, useEffect } from 'react';
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
    nombre: 'Cazador',
    audio: '/cazador.mp3'
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
    nombre: 'Cuidadora',
    audio: '/cuidadora.mp3'
  }
};

const GuardasModal = ({ isOpen, onClose }) => {
  const [personaje, setPersonaje] = useState('cazador');
  const [animacion, setAnimacion] = useState('idle');
  const audioRef = useRef(null);

  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isOpen]);

  const handleAnimacionChange = (nuevaAnimacion) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (nuevaAnimacion === 'especial' && personajesData[personaje].audio) {
      if (audioRef.current) {
        audioRef.current.src = personajesData[personaje].audio;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.log('Error reproduciendo audio:', error);
        });
      }
    }

    setAnimacion(nuevaAnimacion);
  };

  const handlePersonajeChange = (nuevoPersonaje) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setPersonaje(nuevoPersonaje);
    setAnimacion('idle');
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setPersonaje('cazador');
    setAnimacion('idle');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const animData = personajesData[personaje][animacion];
  const nombrePersonaje = personajesData[personaje].nombre;
  const tieneAudio = personajesData[personaje].audio && animacion === 'especial';

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content guardas-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={handleClose}>×</button>

        <h2>Cabaña de Guardas</h2>
        <p>Selecciona un guarda para ver su estado.</p>

        <div className="personaje-selector">
          <button
            onClick={() => handlePersonajeChange('cazador')}
            className={`personaje-button ${personaje === 'cazador' ? 'active' : ''}`}
          >
            Cazador
          </button>
          <button
            onClick={() => handlePersonajeChange('cuidadora')}
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
          {tieneAudio && (
            <div className="audio-indicator">
              🔊 Sonido activado
            </div>
          )}
        </div>

        <div className="anim-controls">
          <p>Controlar animación de: <strong>{nombrePersonaje}</strong></p>
          <button
            onClick={() => handleAnimacionChange('idle')}
            className={`anim-button ${animacion === 'idle' ? 'active' : ''}`}
          >
            Reposo
          </button>
          <button
            onClick={() => handleAnimacionChange('especial')}
            className={`anim-button ${animacion === 'especial' ? 'active' : ''}`}
          >
            {personaje === 'cazador' ? 'Toma de Muestras' : 'Saludo'}
          </button>
        </div>

        <audio
          ref={audioRef}
          preload="auto"
        />
      </div>
    </div>
  );
};

export default GuardasModal;