import React from 'react';
import './Parque.css';

function Recinto({ tipo, nombre, idDinosaurio, onRecintoClick }) {
  const esClickeable = idDinosaurio || tipo === 'edificio';


  const baseClass = `base-${tipo}`;
  const overlayClass = `overlay-${tipo}`;

  return (
    <div
      className="grid-cell"
      onClick={() => onRecintoClick(idDinosaurio)}
      data-clickable={esClickeable}
      title={nombre}
    >
      <div className={`recinto-base ${baseClass}`}></div>

      <div className={`recinto-overlay ${overlayClass}`}></div>

      <div className="cell-name">{nombre}</div>
    </div>
  );
}

export default Recinto;