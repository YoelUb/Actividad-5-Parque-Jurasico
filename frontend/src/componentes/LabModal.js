import React, { useState, useEffect } from 'react';
import './LabModal.css';

const traducciones = {
    'idle': 'Parado',
    'bite': 'Morder',
    'dead': 'Morir',
    'falling': 'Caer',
    'jump': 'Saltar',
    'on-hit': 'Recibir Golpe',
    'pounce': 'Abalanzarse',
    'pounce-end': 'Fin de Ataque',
    'pounced-attack': 'Comer',
    'ready-pounce': 'Preparar Salto',
    'roar': 'Rugir',
    'run': 'Correr',
    'scanning': 'Escaneando',
    'walk': 'Andar'
};


const animacionesDisponibles = [
    { id: 'idle', nombre: traducciones['idle'] },
    { id: 'bite', nombre: traducciones['bite'] },
    { id: 'dead', nombre: traducciones['dead'] },
    { id: 'pounced-attack', nombre: traducciones['pounced-attack'] },
    { id: 'ready-pounce', nombre: traducciones['ready-pounce'] },
    { id: 'roar', nombre: traducciones['roar'] },
    { id: 'run', nombre: traducciones['run'] },
    { id: 'scanning', nombre: traducciones['scanning'] },
    { id: 'walk', nombre: traducciones['walk'] }
];

function LabModal({ isOpen, phase, onClose }) {
    // Estado para saber qué animación de raptor mostrar (usamos el ID 'idle')
    const [animacion, setAnimacion] = useState('idle');

    // Cada vez que el modal se abre o la fase cambia a 'lab',
    // reseteamos la animación a 'idle' (parado)
    useEffect(() => {
        if (isOpen && phase === 'lab') {
            setAnimacion('idle');
        }
    }, [isOpen, phase]);

    if (!isOpen) return null;

    // --- Renderizado de la FASE 1: Helicóptero ---
    const renderHelicoptero = () => (
        <div className="lab-content-inner">
            <img src="/helicoptero.png" alt="Helicóptero" className="helicoptero-img" />
            <p className="cargando-texto">Volando al laboratorio...</p>
        </div>
    );

    // --- Renderizado de la FASE 2: Laboratorio ---
    const renderLaboratorio = () => (
        <div className="lab-content-inner">
            <h3>Laboratorio de Velociraptors</h3>
            <div className="sprite-container">
                <img
                    // El GIF se carga dinámicamente según el estado 'animacion' (el ID)
                    src={`/laboratorio/gif/2x/raptor-${animacion}.gif`}
                    alt={`Raptor ${animacion}`}
                    className="raptor-sprite"
                    // 'key' fuerza a React a recargar el GIF cada vez que cambia la animación
                    key={animacion}
                />
            </div>

            {/* El mapeo de botones ahora solo creará los que están en la lista filtrada */}
            <div className="controles-animacion">
                {animacionesDisponibles.map((anim) => (
                    <button
                        key={anim.id}
                        onClick={() => setAnimacion(anim.id)} // Usamos el ID para cambiar el estado
                        className="control-boton"
                    >
                        {anim.nombre} {/* Usamos el nombre en español para el texto */}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        // El fondo oscuro que cierra el modal al hacer clic
        <div className="modal-backdrop-lab" onClick={onClose}>
            {/* El contenido del modal que EVITA que se cierre al hacer clic dentro */}
            <div className="modal-content-lab" onClick={(e) => e.stopPropagation()}>

                {/* Botón de cerrar (siempre visible en este modal) */}
                <button onClick={onClose} className="close-button-lab">&times;</button>

                {/* Renderizado Condicional: Muestra una fase u otra */}
                {phase === 'helicopter' ? renderHelicoptero() : renderLaboratorio()}

            </div>
        </div>
    );
}

export default LabModal;