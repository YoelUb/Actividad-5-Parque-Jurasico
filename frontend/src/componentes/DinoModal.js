import React from 'react';
import './DinoModal.css';

const getDinoImage = (dinoId) => {
    const dinoImageMap = {
        'dino_001': '/TREX1.png',
        'dino_002': '/mosasaurios.png',
        'dino_003': '/Pteranodon.png',
        'dino_004': '/Triceraptors_2.png',
        'dino_005': '/broncosaurius.png',
    };
    return dinoImageMap[dinoId] || '/logo512.png';
}

function DinoModal({ dino, onClose }) {
    if (!dino) {
        return null;
    }

    const dinoImage = getDinoImage(dino.id);

    return (
        <div className="modal-backdrop-dino" onClick={onClose}>
            <div className="modal-content-dino" onClick={(e) => e.stopPropagation()}>

                <button onClick={onClose} className="close-button-dino">&times;</button>

                <img src={dinoImage} alt={dino.nombre} className="dino-modal-image" />
                <h2>{dino.nombre}</h2>
                <div className="dino-info">
                    <p><strong>Era:</strong> {dino.era}</p>
                    <p><strong>Dieta:</strong> {dino.dieta}</p>
                    <p><strong>Área:</strong> {dino.area}</p>
                    <p><strong>Tipo de Recinto:</strong> {dino.tipo_recinto}</p>

                    {dino.descripcion && (
                        <p className="dino-descripcion">{dino.descripcion}</p>
                    )}

                </div>
            </div>
        </div>
    );
}

export default DinoModal;