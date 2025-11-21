import React from 'react';
import './ModalConfirmacion.css';

const ModalConfirmacion = ({
    isOpen,
    onClose,
    onConfirm,
    message,
    confirmText,
    cancelText
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                <div className="modal-body">
                    <p>{message}</p>
                </div>

                <div className="modal-footer">
                    <button onClick={onConfirm} className="btn-confirmar">
                        {confirmText || 'Sí'}
                    </button>
                    <button onClick={onClose} className="btn-cancelar">
                        {cancelText || 'No'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirmacion;