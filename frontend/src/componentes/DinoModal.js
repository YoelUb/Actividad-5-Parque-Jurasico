import React, {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import SpriteAnimator from './SpriteAnimator';

const dinoImageMap = {
    "dino_001": ["/TREX1.png", "/TREX_2.png"],
    "dino_002": "/mosasaurios.png",
    "dino_003": ["/Pteranodon.png", "/Pteranodon_1  2.png",],
    "dino_004": ["/Triceraptors.png", "/Triceraptors_2.png", "/Triceraptors_3.png", "/Triceraptors_4.png"],
    "dino_005": "/broncosaurius.png",
    "dino_006": "/laboratorio/spritesheets/1x/raptor-run.png"
};

const backdropVariants = {
    hidden: {opacity: 0},
    visible: {opacity: 1},
};

const modalVariants = {
    hidden: {opacity: 0, scale: 0.8},
    exit: {opacity: 0, scale: 0.8, transition: {duration: 0.2, ease: 'easeIn'}},
};

const modalEntryTransition = {
    opacity: {duration: 0.3, ease: 'easeOut'},
    scale: {duration: 0.3, ease: 'easeOut'}
};

const FrameAnimator = ({frames, duration = 1600}) => {
    const [currentFrame, setCurrentFrame] = useState(0);

    useEffect(() => {
        const frameDuration = duration / frames.length;
        const interval = setInterval(() => {
            setCurrentFrame(prev => (prev + 1) % frames.length);
        }, frameDuration);
        return () => clearInterval(interval);
    }, [frames, duration]);

    return (
        <img
            src={frames[currentFrame]}
            alt="dinosaur animation"
            className="h-[50vh] md:h-full object-contain"
            style={{imageRendering: 'pixelated'}}
        />
    );
};

function DinoModal({dino, onClose}) {
    if (!dino) return null;

    const isRaptor = dino.id === 'dino_006';
    const usesFrameAnimator = dino.id === 'dino_001' || dino.id === 'dino_004' || dino.id === 'dino_003';
    const imageSrc = dinoImageMap[dino.id];
    const modalAnimateProps = {opacity: 1, scale: 1};
    const modalTransitionProps = modalEntryTransition;

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
                        animate={modalAnimateProps}
                        transition={modalTransitionProps}
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-full md:w-1/2 bg-gray-900 p-4 flex justify-center items-center">
                            {isRaptor ? (
                                <SpriteAnimator
                                    spriteSheet={imageSrc}
                                    frameCount={6}
                                    frameWidth={80}
                                    frameHeight={80}
                                />
                            ) : usesFrameAnimator ? (
                                <FrameAnimator
                                    frames={imageSrc}
                                    duration={1600}
                                />
                            ) : (
                                <motion.img
                                    src={imageSrc}
                                    alt={dino.nombre}
                                    className="h-[50vh] md:h-full object-contain"
                                    animate={{scale: [1, 1.03, 1]}}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 4,
                                        ease: "easeInOut"
                                    }}
                                />
                            )}
                        </div>

                        <div className="w-full md:w-1/2 p-6 overflow-y-auto">
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