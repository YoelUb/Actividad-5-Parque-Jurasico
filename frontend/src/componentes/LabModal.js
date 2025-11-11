import React, { useState, useEffect } from 'react';
import './LabModal.css';
import { motion, AnimatePresence } from 'framer-motion';

const FRAME_PATHS = [
  '/helicoptero/separated_frames/helicopter_1.png',
  '/helicoptero/separated_frames/helicopter_2.png',
  '/helicoptero/separated_frames/helicopter_3.png',
  '/helicoptero/separated_frames/helicopter_4.png',
  '/helicoptero/separated_frames/helicopter_5.png',
  '/helicoptero/separated_frames/helicopter_6.png',
  '/helicoptero/separated_frames/helicopter_7.png',
  '/helicoptero/separated_frames/helicopter_8.png',
];

const roarSound = new Audio('/rugido.mp3');

const traducciones = {
    'idle': 'Parado',
    'bite': 'Morder',
    'dead': 'Morir',
    'falling': 'Caer',
    'jump': 'Saltar',
    'on-hit': 'Recibir Golpe',
    'pounce': 'Abalanzarse',
    'pounce-end': 'Fin de Ataque',
    'pounced-attack': 'Comer',
    'ready-pounce': 'Preparar Salto',
    'roar': 'Rugir',
    'run': 'Correr',
    'scanning': 'Escaneando',
    'walk': 'Andar'
};

const animacionesDisponibles = [
    { id: 'idle', nombre: traducciones['idle'] },
    { id: 'bite', nombre: traducciones['bite'] },
    { id: 'dead', nombre: traducciones['dead'] },
    { id: 'pounced-attack', nombre: traducciones['pounced-attack'] },
    { id: 'ready-pounce', nombre: traducciones['ready-pounce'] },
    { id: 'roar', nombre: traducciones['roar'] },
    { id: 'run', nombre: traducciones['run'] },
    { id: 'scanning', nombre: traducciones['scanning'] },
    { id: 'walk', nombre: traducciones['walk'] }
];

const LabModal = ({ isOpen, phase, onClose }) => {
  const [animacion, setAnimacion] = useState('idle');
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (isOpen && phase === 'lab') {
      setAnimacion('idle');
    }
  }, [isOpen, phase]);

  useEffect(() => {
    if (phase !== 'helicopter' || !isOpen) return;

    const intervalId = setInterval(() => {
      setFrame(prevFrame => (prevFrame + 1) % FRAME_PATHS.length);
    }, 80);

    return () => clearInterval(intervalId);
  }, [phase, isOpen]);

  useEffect(() => {
    if (animacion === 'roar' && isOpen && phase === 'lab') {
      roarSound.play();
    }
  }, [animacion, isOpen, phase]);

  const renderContent = () => {
    if (phase === 'helicopter') {
      return (
        <div className="lab-modal-helicopter-phase">
          <motion.img
            src={FRAME_PATHS[frame]}
            alt="Volando..."
            className="helicopter-sprite"
            initial={{ x: '-100%', y: '100%' }}
            animate={{ x: '100%', y: '-100%' }}
            transition={{ duration: 3, ease: 'linear' }}
          />
          <p className="cargando-texto-lab">Volando al laboratorio...</p>
        </div>
      );
    }

    if (phase === 'lab') {
      return (
        <motion.div
          className="lab-modal-lab-phase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3>Laboratorio de Velociraptors</h3>
          <div className="sprite-container">
            <img
              src={`/laboratorio/gif/2x/raptor-${animacion}.gif`}
              alt={`Raptor ${animacion}`}
              className="raptor-sprite"
              key={animacion}
            />
          </div>
          <div className="controles-animacion">
            {animacionesDisponibles.map((anim) => (
              <button
                key={anim.id}
                onClick={() => setAnimacion(anim.id)}
                className="control-boton"
              >
                {anim.nombre}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="lab-modal-close-btn">
            Salir del Laboratorio
          </button>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="lab-modal-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="lab-modal-content"
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.7 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="close-button-lab">&times;</button>
            {renderContent()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LabModal;