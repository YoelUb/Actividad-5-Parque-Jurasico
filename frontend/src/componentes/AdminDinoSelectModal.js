import React from 'react';
import './AdminDinoSelectModal.css';

const AdminDinoSelectModal = ({ isOpen, onClose, onSelectDino, dinoOptions, title, description }) => {
    if (!isOpen) {
        return null;
    }

    const handleBackdropClick = (e) => {
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <p className="modal-description">{description}</p>

                <div className="modal-grid">
                    {dinoOptions.map((dino) => (
                        <div
                            key={dino.value}
                            className="dino-option-card"
                            onClick={() => onSelectDino(dino.value)}
                        >
                            <img src={dino.previewPath} alt={dino.label} />
                            <span>{dino.label}</span>
                            <p className="dino-info">{dino.info}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDinoSelectModal;