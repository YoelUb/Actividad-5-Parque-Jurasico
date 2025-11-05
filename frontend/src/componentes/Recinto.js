import React from 'react';
import './Parque.css';

function Recinto({ tipo, nombre, idDinosaurio, onRecintoClick }) {

  const claseTipo = `grid-cell ${tipo}`; 
  const esClickeable = idDinosaurio || tipo === 'edificio';

  return (
    <div
      className={claseTipo}
      onClick={() => onRecintoClick(idDinosaurio)}
      data-clickable={esClickeable}
      title={nombre}
    >
      <div className="cell-name">{nombre}</div>
    </div>
  );
}

export default Recinto;