import React, { useState, useEffect } from 'react';
import SpriteAnimator from './SpriteAnimator';
import './DinoModal.css';

const DinoModal = ({ dino, onClose }) => {
  const [animacionActual, setAnimacionActual] = useState('idle');

  useEffect(() => {
    if (dino) {
      setAnimacionActual('idle');
    }
  }, [dino]);

  if (!dino) {
    return null;
  }

  const handleClose = () => {
    onClose();
  };

  const handleAnimacionChange = (nuevaAnimacion) => {
    setAnimacionActual(nuevaAnimacion);
  };

  const animData = dino.animations ? dino.animations[animacionActual] : null;

  let finalBasePath = dino.sprite_base_path;
  if (animData && animData.length > 2) {
      finalBasePath = finalBasePath + animData[2];
  }

  const dietaNormalizada = dino.dieta ? dino.dieta.toLowerCase() : '';
  const nombreNormalizado = dino.nombre ? dino.nombre.toLowerCase() : '';

  const esDinosaurioTerrestre =
    (dietaNormalizada === 'carnívoro' && !nombreNormalizado.includes('pteranodon')) ||
    (dietaNormalizada === 'herbívoro' && nombreNormalizado.includes('brontosaurus'));

  const mostrarControlesAnimacion = () => {
    return esDinosaurioTerrestre && animData && dino.sprite_base_path;
  };

  const animacionesDisponibles = () => {
    if (!dino.animations) return [];

    const animaciones = ['idle'];

    if (esDinosaurioTerrestre && dino.animations.walk) {
      animaciones.push('walk');
    }

    return animaciones;
  };

  const animaciones = animacionesDisponibles();

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content dino-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={handleClose}>×</button>
        <h2>{dino.nombre}</h2>
        <p><strong>Especie:</strong> {dino.especie}</p>
        <p><strong>Dieta:</strong> {dino.dieta}</p>
        <p><strong>Hábitat:</strong> {dino.habitat || 'No especificado'}</p>
        <p className="descripcion">{dino.descripcion}</p>

        {animData && dino.sprite_base_path ? (
          <>
            <div className="anim-container">
              <SpriteAnimator
                basePath={finalBasePath}
                frameCount={animData[1] - animData[0] + 1}
                startFrame={animData[0]}
                fps={10}
                scale={3}
              />
            </div>

            {mostrarControlesAnimacion() && (
              <div className="anim-controls">
                {animaciones.includes('idle') && (
                  <button
                    onClick={() => handleAnimacionChange('idle')}
                    className={`anim-button ${animacionActual === 'idle' ? 'active' : ''}`}
                  >
                    Ver Quieto
                  </button>
                )}
                {animaciones.includes('walk') && (
                  <button
                    onClick={() => handleAnimacionChange('walk')}
                    className={`anim-button ${animacionActual === 'walk' ? 'active' : ''}`}
                  >
                    Caminar
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <p>No hay animación disponible para este dinosaurio.</p>
        )}

        {!esDinosaurioTerrestre && dino.dieta && (
          <div className="info-message">
            <p>💡 Este animal muestra su comportamiento natural en su hábitat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DinoModal;