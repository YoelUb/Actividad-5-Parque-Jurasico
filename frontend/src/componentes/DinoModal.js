import React, { useState, useEffect, useRef } from 'react';
import SpriteAnimator from './SpriteAnimator';
import './DinoModal.css';

const DinoModal = ({ dino, onClose }) => {
  const [animacionActual, setAnimacionActual] = useState('idle');
  const audioRef = useRef(null);

  useEffect(() => {
    if (dino) {
      setAnimacionActual('idle');
    }
  }, [dino]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/rugido.mp3');
      audioRef.current.preload = 'auto';
    }

    if (animacionActual === 'walk' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error al reproducir audio:", e));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [animacionActual]);

  if (!dino) {
    return null;
  }

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
  };

  const handleAnimacionChange = (nuevaAnimacion) => {
    setAnimacionActual(nuevaAnimacion);
  };

  const animData = dino.animations ? dino.animations[animacionActual] : null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content dino-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={handleClose}>×</button>
        <h2>{dino.nombre}</h2>
        <p><strong>Especie:</strong> {dino.especie}</p>
        <p><strong>Dieta:</strong> {dino.dieta}</p>
        <p className="descripcion">{dino.descripcion}</p>

        {animData && dino.sprite_base_path ? (
          <>
            <div className="anim-container">
              <SpriteAnimator
                basePath={dino.sprite_base_path}
                frameCount={animData[1] - animData[0] + 1}
                startFrame={animData[0]}
                fps={10}
                scale={3}
              />
            </div>
            <div className="anim-controls">
              <button
                onClick={() => handleAnimacionChange('idle')}
                className={`anim-button ${animacionActual === 'idle' ? 'active' : ''}`}
              >
                Ver Quieto
              </button>
              <button
                onClick={() => handleAnimacionChange('walk')}
                className={`anim-button ${animacionActual === 'walk' ? 'active' : ''}`}
              >
                Rugir y Caminar
              </button>
            </div>
          </>
        ) : (
          <p>No hay animación disponible para este dinosaurio.</p>
        )}
      </div>
    </div>
  );
};

export default DinoModal;