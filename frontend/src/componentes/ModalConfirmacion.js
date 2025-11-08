import React from 'react';
import './ModalConfirmacion.css';

const ModalConfirmacion = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3><span>⚠️</span> ¡ATENCIÓN! <span>⚠️</span></h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button onClick={onConfirm} className="btn-confirmar">
            Sí, abandonar
          </button>
          <button onClick={onClose} className="btn-cancelar">
            No, quedarse
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;