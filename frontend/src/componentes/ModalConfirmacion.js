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
                <p>{message}</p>
                <div className="modal-buttons">
                    <button onClick={onConfirm} className="modal-btn confirm-btn">
                        {confirmText || 'Sí'}
                    </button>
                    <button onClick={onClose} className="modal-btn cancel-btn">
                        {cancelText || 'No'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirmacion;