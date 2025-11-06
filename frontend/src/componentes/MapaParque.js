import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import './Parque.css';


const bounds = [[0, 0], [820, 660]];
const mapMinZoom = 0;
const mapMaxZoom = 2;
const center = [410, 330];

function MapRefresher({ bounds }) {
  const map = useMap();

  useEffect(() => {

    const timer = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(bounds);
    }, 100);
    return () => clearTimeout(timer);
  }, [map, bounds]);

  return null;
}


const MapaParque = ({ diseno, enClickRecinto }) => {

    const dinosaurios = diseno?.dinosaurios || [];

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });

    return (
        <MapContainer
            className="mapa-container"
            crs={L.CRS.Simple}
            bounds={bounds}
            minZoom={mapMinZoom}
            maxZoom={mapMaxZoom}
            center={center}
            zoomControl={false}
        >
            <MapRefresher bounds={bounds} />

            <TileLayer
                url="/map-tiles/{z}/{x}/{y}.png"
                attribution='&copy; Jurassic World'
                noWrap={true}
            />

            {dinosaurios.map(dino => (
                <Marker
                    key={dino.id}
                    position={[dino.posicion_y, dino.posicion_x]}
                    eventHandlers={{
                        click: () => enClickRecinto(dino.id),
                    }}
                >
                    <Popup>
                        <b>{dino.nombre}</b><br />
                        Especie: {dino.especie}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapaParque;