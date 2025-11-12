import React, { useState } from 'react'; // Importa useState
import SpriteAnimator from './SpriteAnimator';
import './DinoModal.css';

const DinoModal = ({ dino, onClose }) => {
    const [animationType, setAnimationType] = useState('idle');

    if (!dino) {
        return null;
    }

    const tieneAnimaciones = dino.sprite_base_path && dino.animations;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="dino-modal-content" onClick={(e) => e.stopPropagation()}>

                <h2>{dino.nombre}</h2>
                <span className="dino-species">{dino.especie} - {dino.dieta}</span>

                <div className="dino-modal-body">
                    <div className="dino-anim-container">
                        {tieneAnimaciones ? (
                            <SpriteAnimator
                                basePath={dino.sprite_base_path}
                                animations={dino.animations}
                                animationName={animationType}
                                fps={10}
                            />
                        ) : (
                            <div className="anim-placeholder">Animación no disponible</div>
                        )}
                    </div>
                    <p className="dino-description">{dino.descripcion}</p>
                </div>

                {tieneAnimaciones && (
                    <div className="dino-modal-controls">
                        <button
                            onClick={() => setAnimationType('idle')}
                            className={animationType === 'idle' ? 'active' : ''}
                        >
                            Parado (Idle)
                        </button>
                        <button
                            onClick={() => setAnimationType('walk')}
                            className={animationType === 'walk' ? 'active' : ''}
                        >
                            Andar
                        </button>
                    </div>
                )}

                <button onClick={onClose} className="modal-close-btn">&times;</button>
            </div>
        </div>
    );
};

export default DinoModal;