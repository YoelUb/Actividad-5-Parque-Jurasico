import React, { useState } from 'react';
import axios from 'axios';
import './MapaJurassic.css';


const PanelInfo = ({ info, onClose }) => {
    if (!info) return null;

    const isError = info.error;

    return (
        <div className="info-panel">
            <button onClick={onClose} className="info-panel-close">&times;</button>
            {isError ? (
                <h3 className="info-panel-title text-red-500">Error</h3>
            ) : (
                <h3 className="info-panel-title">{info.nombre}</h3>
            )}
            <div className="info-panel-content">
                {isError ? (
                    <p>{info.error}</p>
                ) : (
                    <>
                        <p><strong>Estado:</strong> <span className={`status status-${info.estado?.toLowerCase()}`}>{info.estado}</span></p>
                        <p><strong>Zona:</strong> {info.zona}</p>
                        <p><strong>Nivel de Peligro:</strong> {info.nivel_peligro}</p>
                    </>
                )}
            </div>
        </div>
    );
};

const MapaJurassic = () => {
    const [selectedInfo, setSelectedInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);


    const handleFetchInfo = async (recintoId) => {
        setIsLoading(true);
        setSelectedInfo(null);
        try {

            const response = await axios.get(`/api/info/${recintoId}`);
            setSelectedInfo(response.data);
        } catch (error) {
            console.error("Error al obtener información del recinto:", error);
            setSelectedInfo({ error: `No se pudo cargar la información para ${recintoId}` });
        } finally {
            setIsLoading(false);
        }
    };


    const hotspots = [
        { id: 'trex', top: '40%', left: '60%', emoji: '🦖' },
        { id: 'raptor', top: '55%', left: '30%', emoji: '🦴' },
        { id: 'brachiosaurus', top: '25%', left: '45%', emoji: '🦕' },
    ];

    return (
        <div className="map-container-genially">

            <iframe
                title="Mapa Interactivo Jurassic Park"
                src="https://view.genially.com/6162206861d5020ddc3b5100/interactive-image-jurassic-park-map"
                className="map-iframe"
                allowFullScreen
            ></iframe>

            <div className="hotspot-layer">
                {hotspots.map(spot => (
                    <button
                        key={spot.id}
                        className="hotspot-button"
                        style={{ top: spot.top, left: spot.left }}
                        onClick={() => handleFetchInfo(spot.id)}
                        aria-label={`Información sobre ${spot.id}`}
                    >
                        <span className="hotspot-emoji">{spot.emoji}</span>
                        <span className="hotspot-pulse"></span>
                    </button>
                ))}
            </div>

            {(isLoading || selectedInfo) && (
                <PanelInfo
                    info={isLoading ? { nombre: 'Cargando...' } : selectedInfo}
                    onClose={() => setSelectedInfo(null)}
                />
            )}
        </div>
    );
};

export default MapaJurassic;