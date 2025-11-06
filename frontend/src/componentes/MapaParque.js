import React from 'react';
import { MapContainer, ImageOverlay, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './Parque.css';

import mapaDelParque from '../assets/mapa_parque.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const bounds = [[0, 0], [600, 600]];

function convertirGridACoords(gridId) {
  const fila = gridId.charCodeAt(0) - 'a'.charCodeAt(0);
  const col = parseInt(gridId.charAt(1), 10) - 1;

  const x = col * 200 + 100;
  const y = (2 - fila) * 200 + 100;

  return [y, x];
}

function MapaParque({ diseno, enClickRecinto }) {
  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      minZoom={-1}
      className="mapa-container"
    >
      <ImageOverlay
        url={mapaDelParque}
        bounds={bounds}
      />

      {diseno.recintos.map(recinto => {
        if (!recinto.id_dinosaurio) {
          return null;
        }

        const posicion = convertirGridACoords(recinto.grid_id);

        return (
          <Marker
            key={recinto.grid_id}
            position={posicion}
            eventHandlers={{
              click: () => {
                enClickRecinto(recinto.id_dinosaurio);
              },
            }}
          >
            <Popup>
              <strong>{recinto.nombre}</strong>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default MapaParque;