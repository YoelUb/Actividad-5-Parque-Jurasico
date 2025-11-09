import React, { useState, useEffect } from 'react'; // <--- CAMBIO: Importamos useState y useEffect
import { motion, AnimatePresence } from 'framer-motion';
import SpriteAnimator from './SpriteAnimator'; // Este es para el raptor


const dinoImageMap = {
    "dino_001": ["/TREX-1.png", "/TREX_2.png", "/TREX_3.png", "/TREX_4.png"],
    "dino_002": "/mosasaurios.png",
    "dino_003": "/Pteranodon.png",
    "dino_004": "/Triceraptors.png",
    "dino_005": "/broncosaurius.png",
    "dino_006": "/laboratorio/spritesheets/1x/raptor-run.png" // El sprite
};
// ---------------------------------------------------------

// Animaciones para el fondo oscuro
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

// Variantes del Modal (solo entrada y salida)
const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2, ease: 'easeIn' } },
};

// Transición de entrada simple (para dinos animados como T-Rex y Raptor)
const modalEntryTransition = {
    opacity: { duration: 0.3, ease: 'easeOut' },
    scale: { duration: 0.3, ease: 'easeOut' }
};

// Transición de PISOTÓN (para dinos ESTÁTICOS)
const modalStompTransition = {
    opacity: { duration: 0.3, ease: 'easeOut' },
    scale: { duration: 0.3, ease: 'easeOut' },
    x: {
        repeat: Infinity,
        duration: 0.4,
        ease: "easeInOut"
    }
};

// --- CAMBIO 2: Nuevo componente interno para animar por frames ---
// Animará cualquier cosa que le pases como un array de imágenes
const FrameAnimator = ({ frames, duration = 800 }) => {
    const [currentFrame, setCurrentFrame] = useState(0);

    useEffect(() => {
        // Calcula cuánto tiempo debe durar cada frame
        const frameDuration = duration / frames.length;

        const interval = setInterval(() => {
            // Avanza al siguiente frame, volviendo a 0 si es el último
            setCurrentFrame(prev => (prev + 1) % frames.length);
        }, frameDuration);

        // Limpia el intervalo cuando el componente se desmonta
        return () => clearInterval(interval);
    }, [frames, duration]); // Se reinicia si cambian las imágenes o la duración

    return (
        <img
            src={frames[currentFrame]}
            alt="dinosaur animation"
            className="max-h-[50vh] md:max-h-full object-contain"
            // Añadimos 'image-rendering' para un look pixelado si aplica
            style={{ imageRendering: 'pixelated' }}
        />
    );
};
// ---------------------------------------------------------------


function DinoModal({ dino, onClose }) {
    if (!dino) return null;

    // --- CAMBIO 3: Lógica para saber qué tipo de animación usar ---
    const isRaptor = dino.id === 'dino_006'; // Usa SpriteAnimator
    const isTrex = dino.id === 'dino_001';   // Usa FrameAnimator

    // Si es T-Rex o Raptor, tiene animación de movimiento
    const hasWalkAnimation = isRaptor || isTrex;

    const imageSrc = dinoImageMap[dino.id]; // Esto será un string o un array

    // El modal tiembla SÓLO si el dino es estático (ni T-Rex ni Raptor)
    const modalAnimateProps = hasWalkAnimation
        ? { opacity: 1, scale: 1 } // Entrada simple
        : {
            opacity: 1,
            scale: 1,
            x: [0, -4, 4, -4, 4, 0] // Entrada con pisotón
          };

    const modalTransitionProps = hasWalkAnimation
        ? modalEntryTransition
        : modalStompTransition;
    // -------------------------------------------------------------

    return (
        <AnimatePresence>
            {dino && (
                <motion.div
                    className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
                        variants={modalVariants}
                        initial="hidden"
                        animate={modalAnimateProps}      // <-- Prop de animación dinámica
                        transition={modalTransitionProps} // <-- Prop de transición dinámica
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Columna de la Imagen / Animación */}
                        <div className="w-full md:w-12 bg-gray-900 p-4 flex justify-center items-center">

                            {/* --- CAMBIO 4: Lógica de renderizado de 3 vías --- */}

                            {isRaptor ? (
                                // 1. El Raptor usa el SpriteAnimator (CSS)
                                <SpriteAnimator
                                    spriteSheet={imageSrc}
                                    frameCount={6}
                                    frameWidth={80}
                                    frameHeight={80}
                                />
                            ) : isTrex ? (
                                // 2. El T-Rex usa el FrameAnimator (React)
                                <FrameAnimator
                                    frames={imageSrc} // Le pasamos el array de 4 imágenes
                                    duration={800}    // 800ms para el ciclo completo (200ms por frame)
                                />
                            ) : (
                                // 3. El resto (estáticos) usan motion.img
                                <motion.img
                                    src={imageSrc}
                                    alt={dino.nombre}
                                    className="max-h-[50vh] md:max-h-full object-contain"
                                    animate={{ scale: [1, 1.03, 1] }} // Animación sutil de respiración
                                    transition={{
                                        repeat: Infinity,
                                        duration: 4,
                                        ease: "easeInOut"
                                    }}
                                />
                            )}
                            {/* ------------------------------------------- */}
                        </div>

                        {/* Columna de la Información (sin cambios) */}
                        <div className="w-full md:w-12 p-6 overflow-y-auto">
                            <h2 className="font-jurassic text-4xl text-red-500 font-bold mb-4">
                                {dino.nombre}
                            </h2>
                            <div className="space-y-3 text-lg text-white">
                                <p><strong className="text-yellow-400">Era:</strong> {dino.era}</p>
                                <p><strong className="text-yellow-400">Dieta:</strong> {dino.dieta}</p>
                                <p><strong className="text-yellow-400">Área:</strong> {dino.area}</p>
                                <p><strong className="text-yellow-400">Recinto:</strong> {dino.tipo_recinto}</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default DinoModal;