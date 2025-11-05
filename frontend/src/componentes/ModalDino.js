import React from 'react';
import './ModalDino.css';

function ModalDino({ dinosaurio, alCerrar }) {
  return (
    <div className="modal-overlay" onClick={alCerrar}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{dinosaurio.nombre}</h2>
        <p><strong>Tipo:</strong> {dinosaurio.tipo_recinto}</p>
        <p><strong>Era:</strong> {dinosaurio.era}</p>
        <p><strong>Área:</strong> {dinosaurio.area}</p>
        <p><strong>Dieta:</strong> {dinosaurio.dieta}</p>
        <button className="modal-close-button" onClick={alCerrar}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default ModalDino;