import React, { useState, useEffect, useMemo } from 'react';
import './JeepModal.css';
import { motion, AnimatePresence } from 'framer-motion';


const JeepModal = ({ isOpen, onClose, locations = [], onSelectLocation, phase, jeepColor = 'Green' }) => {
  const [frame, setFrame] = useState(0);

  const { framesIdle, framesViaje } = useMemo(() => {
    const color = jeepColor.charAt(0).toUpperCase() + jeepColor.slice(1);

    const generateFrames = (direction) => {
      const frames = [];
      for (let i = 0; i <= 11; i++) {
        const num = i.toString().padStart(3, '0');
        frames.push(`/Jeep/Jeep_${color}/MOVE/${direction}/SEPARATED/${color}_JEEP_CLEAN_${direction}_${num}.png`);
      }
      return frames;
    };

    return {
      framesIdle: generateFrames('SOUTH'),
      framesViaje: generateFrames('EAST')
    };
  }, [jeepColor]);

  useEffect(() => {
    if (!isOpen) return;

    const frameSet = phase === 'lista' ? framesIdle : framesViaje;

    const intervalId = setInterval(() => {
      setFrame(prevFrame => (prevFrame + 1) % frameSet.length);
    }, 100);

    return () => clearInterval(intervalId);
  }, [isOpen, phase, framesIdle, framesViaje]);

  const filteredLocations = locations.filter(loc => loc.name !== 'Coche');

  const currentFrame = (phase === 'lista' ? framesIdle : framesViaje)[frame];

  const renderContent = () => {
    if (phase === 'viaje') {
      return (
        <div className="jeep-viaje-phase">
          <motion.img
            src={currentFrame}
            alt="Viajando..."
            className="jeep-sprite-viaje"
            initial={{ scale: 1.5, x: '-150%' }}
            animate={{ x: '150%' }}
            transition={{ duration: 4, ease: 'linear' }}
          />
          <p className="cargando-texto-jeep">Viajando al destino...</p>
        </div>
      );
    }

    return (
      <div className="jeep-modal-layout">
        <div className="jeep-anim-container">
          <img
            src={currentFrame}
            alt="Jeep"
            className="jeep-sprite"
          />
          <h3>Selecciona tu Destino</h3>
          <p>Elige un punto del mapa para viajar.</p>
        </div>
        <div className="jeep-location-list">
          {filteredLocations.map((loc) => (
            <button
              key={loc.name}
              className="location-button"
              onClick={() => onSelectLocation(loc)}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="jeep-modal-backdrop"
          onClick={phase === 'lista' ? onClose : null}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="jeep-modal-content"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {phase === 'lista' && (
              <button onClick={onClose} className="close-button-jeep">&times;</button>
            )}
            {renderContent()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JeepModal;