import React, { useState } from 'react';
import './IntroAnimacion.css';

function IntroAnimacion({ onEmpezar }) {
  const [desapareciendo, setDesapareciendo] = useState(false);

  const handleStart = () => {
    setDesapareciendo(true);
    setTimeout(() => {
      onEmpezar();
    }, 1500);
  };

  return (
    <div className={`intro-container ${desapareciendo ? 'hidden' : ''}`}>
      <div className="perspective-container">
        <div className="crawl-content">
          <div className="crawl-title">
            <p>Episodio UAX</p>
            <h1>PARQUE JURÁSICO</h1>
          </div>
          <p>
            Es un período de inestabilidad en la Isla Nublar. Tras un fallo crítico del sistema,
            los dinosaurios campan a sus anchas.
          </p>
          <p>
            Los velociraptores han sido avistados cerca del centro de visitantes y el T-Rex
            ha roto el vallado perimetral.
          </p>
          <p>
            Un administrador valiente (tú) es la única esperanza. Tu misión: infiltrarte en el
            sistema, reactivar la seguridad y salvar el parque...
          </p>
        </div>
      </div>

      <button className="empezar-button" onClick={handleStart}>
        Empezar
      </button>
    </div>
  );
}

export default IntroAnimacion;
