import React, { useState, useEffect } from 'react';
import './JeepModal.css';
import { motion, AnimatePresence } from 'framer-motion';

const FRAME_PATHS_IDLE = [
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_000.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_001.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_002.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_003.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_004.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_005.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_006.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_007.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_008.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_009.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_010.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_011.png',
];

const FRAME_PATHS_VIAJE = [
  '/Jeep/Jeep_Green/MOVE/EAST/SEPARATED/Green_JEEP_CLEAN_EAST_000.png',
  '/Jeep/Jeep_Green/MOVE/EAST/SEPARATED/Green_JEEP_CLEAN_EAST_001.png',
  '/Jeep/Jeep_Green/MOVE/EAST/SEPARATED/Green_JEEP_CLEAN_EAST_002.png',
  '/Jeep/Jeep_Green/MOVE/EAST/SEPARATED/Green_JEEP_CLEAN_EAST_003.png',
  '/Jeep/Jeep_Green/MOVE/EAST/SEPARATED/Green_JEEP_CLEAN_EAST_004.png',
  '/Jeep/Jeep_Green/MOVE/EAST/SEPARATED/Green_JEEP_CLEAN_EAST_005.png',
  '/Jeep/Jeep_Green/MOVE/EAST/SEPARATED/Green_JEEP_CLEAN_EAST_006.png',
  '/Jeep/Jeep_Green/MOVE/EAST/SEPARATED/Green_JEEP_CLEAN_EAST_007.png',
  '/Jeep/Jeep_Green/MOVE/EAST/SEPARATED/Green_JEEP_CLEAN_EAST_008.png',
  '/Jeep/Jeep_Green/MOVE/EAST/SEPARATED/Green_JEEP_CLEAN_EAST_009.png',
  '/Jeep/Jeep_Green/MOVE/EAST/SEPARATED/Green_JEEP_CLEAN_EAST_010.png',
  '/Jeep/Jeep_Green/MOVE/EAST/SEPARATED/Green_JEEP_CLEAN_EAST_011.png',
];

const JeepModal = ({ isOpen, onClose, locations = [], onSelectLocation, phase }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const frameSet = phase === 'lista' ? FRAME_PATHS_IDLE : FRAME_PATHS_VIAJE;

    const intervalId = setInterval(() => {
      setFrame(prevFrame => (prevFrame + 1) % frameSet.length);
    }, 100);

    return () => clearInterval(intervalId);
  }, [isOpen, phase]);

  const filteredLocations = locations.filter(loc => loc.name !== 'Coche');
  const currentFrame = (phase === 'lista' ? FRAME_PATHS_IDLE : FRAME_PATHS_VIAJE)[frame];

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