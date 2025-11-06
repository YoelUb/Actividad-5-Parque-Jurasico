import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import './Parque.css';

const bounds = [[0, 0], [820, 660]]; // [Y, X]
const mapMinZoom = 0;
const mapMaxZoom = 2;
const center = [410, 330]; // Centro [Y, X]

const gridIdToCoordenadas = (gridId) => {
    const coords = {
        'a1': [136, 110],
        'a2': [136, 330],
        'a3': [136, 550],
        'b1': [410, 110],
        'b2': [410, 330],
        'b3': [410, 550],
        'c1': [683, 110],
        'c2': [683, 330],
        'c3': [683, 550],
    };
    return coords[gridId] || center;
};

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


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

    const recintos = diseno?.recintos || [];

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

            {recintos.map(recinto => (
                <Marker
                    key={recinto.grid_id}
                    position={gridIdToCoordenadas(recinto.grid_id)}
                    eventHandlers={{
                        click: () => enClickRecinto(recinto.id_dinosaurio),
                    }}
                >
                    <Popup>
                        <b>{recinto.nombre}</b><br />
                        Tipo: {recinto.tipo}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapaParque;