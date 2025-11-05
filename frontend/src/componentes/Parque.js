import React, { useState, useEffect } from 'react';
import Recinto from './Recinto';
import './DisenoParque.css';

const API_URL = 'http://localhost:8000/api/v1/parque';

function DisenoParque({ enClickRecinto, token }) {
  const [diseno, setDiseno] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerDiseno = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/diseno`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!respuesta.ok) throw new Error('No se pudo cargar el parque. ¿Está la API funcionando?');
        const data = await respuesta.json();
        setDiseno(data);
      } catch (err) {
        setError(err.message);
      }
    };
    obtenerDiseno();
  }, [token]);

  if (error) {
    return <div className="error">{error}</div>;
  }
  if (!diseno) {
    return <div>Cargando parque...</div>;
  }

  const estiloGrid = {
    display: 'grid',
    gridTemplateColumns: `repeat(${diseno.tamano_grid[1]}, 1fr)`,
    gridTemplateRows: `repeat(${diseno.tamano_grid[0]}, 200px)`,
  };

  return (
    <div className="park-grid" style={estiloGrid}>
      {diseno.recintos.map(recinto => (
        <Recinto
          key={recinto.grid_id}
          tipo={recinto.tipo}
          nombre={recinto.nombre}
          idDinosaurio={recinto.id_dinosaurio}
          onRecintoClick={enClickRecinto}
        />
      ))}
    </div>
  );
}

export default DisenoParque;