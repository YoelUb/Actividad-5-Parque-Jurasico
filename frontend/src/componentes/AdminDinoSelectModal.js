import React from 'react';
import './AdminDinoSelectModal.css';
import SpriteAnimator from './SpriteAnimator';

const AdminDinoSelectModal = ({ isOpen, onClose, onSelectDino, dinoOptions }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="admin-dino-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h2>Seleccionar Dinosaurio Carnívoro</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>

                <p className="admin-modal-instructions">
                    Elige la variante de T-Rex que se mostrará en el recinto de carnívoros.
                </p>

                <div className="dino-selection-grid">
                    {dinoOptions.map((dino) => (
                        <div key={dino.value} className="dino-card">
                            <div className="dino-card-anim-container">
                                <SpriteAnimator
                                    basePath={dino.path}
                                    frameCount={18}
                                    fps={10}
                                />
                            </div>
                            <h3>{dino.label}</h3>
                            <p>{dino.info}</p>
                            <button
                                className="dino-select-btn"
                                onClick={() => onSelectDino(dino.value)}
                            >
                                Seleccionar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDinoSelectModal;