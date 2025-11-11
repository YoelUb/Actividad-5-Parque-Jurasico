import React, {useRef, useState, useEffect} from 'react';
import {Stage, Layer, Image, Circle, Label, Tag, Text} from 'react-konva';
import useImage from 'use-image';

const ORIGINAL_WIDTH = 1152;
const ORIGINAL_HEIGHT = 768;

const locations = [
    {"name": "Recinto Carnívoros", "x": 236, "y": 290, "r": 8, "dinoId": "dino_001"},
    {"name": "Recinto Herbívoros", "x": 334, "y": 374, "r": 8, "dinoId": "dino_004"},
    {"name": "Recinto Aviario", "x": 500, "y": 438, "r": 8, "dinoId": "dino_003"},
    {"name": "Puerta", "x": 857, "y": 620, "r": 8},
    {"name": "Coche", "x": 608, "y": 658, "r": 8},
    {"name": "Recinto Acuario", "x": 862, "y": 159, "r": 8, "dinoId": "dino_002"},
    {"name": "Guardas", "x": 484, "y": 336, "r": 8},
    {"name": "Helipuerto", "x": 575, "y": 175, "r": 8},
];

const MapaImage = ({width, height}) => {
    const [image] = useImage('/mapa.png');
    return <Image image={image} width={width} height={height}/>;
};

const MapPoint = ({point, scaleX, scaleY, onHover, onSalirClick, onDinoSelect, onHelipuertoClick}) => {
    const [isHovered, setIsHovered] = useState(false);

    const scaleAvg = (scaleX + scaleY) / 2;
    const scaledRadius = point.r * scaleAvg;

    const handleMouseEnter = (e) => {
        onHover(true, {
            x: (point.x * scaleX) + scaledRadius + 5,
            y: point.y * scaleY,
            text: point.name
        });
        setIsHovered(true);
        const stage = e.target.getStage();
        if (stage) stage.content.style.cursor = 'pointer';
    };

    const handleMouseLeave = (e) => {
        onHover(false, null);
        setIsHovered(false);
        const stage = e.target.getStage();
        if (stage) stage.content.style.cursor = 'default';
    };

    return (
        <Circle
            x={point.x * scaleX}
            y={point.y * scaleY}
            radius={isHovered ? scaledRadius * 1.2 : scaledRadius}
            fill="#ff4136"
            stroke="#ffffff"
            strokeWidth={2}
            shadowBlur={isHovered ? 10 : 5}
            shadowColor="black"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}

            onClick={() => {
                if (point.name === "Puerta" && onSalirClick) {
                    onSalirClick();
                } else if (point.dinoId && onDinoSelect) {
                    onDinoSelect(point.dinoId);
                } else if (point.name === "Helipuerto" && onHelipuertoClick) {
                    onHelipuertoClick();
                } else {
                    console.log(`Clic en: ${point.name} (sin acción)`);
                }
            }}
        />
    );
};

const MapaJurassic = ({ onSalirClick, onDinoSelect, onHelipuertoClick }) => {
    const wrapperRef = useRef(null);
    const [size, setSize] = useState({width: ORIGINAL_WIDTH, height: ORIGINAL_HEIGHT});
    const [tooltip, setTooltip] = useState(null);

    useEffect(() => {
        const updateSize = () => {
            if (wrapperRef.current) {
                const containerWidth = wrapperRef.current.offsetWidth;
                const containerHeight = Math.min(
                    containerWidth * (ORIGINAL_HEIGHT / ORIGINAL_WIDTH),
                    window.innerHeight * 0.9
                );

                setSize({
                    width: containerWidth,
                    height: containerHeight
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const handlePointHover = (isVisible, data) => {
        if (isVisible) {
            setTooltip(data);
        } else {
            setTooltip(null);
        }
    };

    const scaleX = size.width / ORIGINAL_WIDTH;
    const scaleY = size.height / ORIGINAL_HEIGHT;

    return (
        <div
            ref={wrapperRef}
            className="map-wrapper"
            style={{
                width: '100%',
                height: 'auto',
                maxHeight: '90vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#1a1a1a',
                padding: '20px 0',
                boxSizing: 'border-box'
            }}
        >
            <Stage
                width={size.width}
                height={size.height}
                style={{
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}
            >
                <Layer>
                    <MapaImage width={size.width} height={size.height}/>

                    {locations.map((loc) => (
                        <MapPoint
                            key={loc.name}
                            point={loc}
                            scaleX={scaleX}
                            scaleY={scaleY}
                            onHover={handlePointHover}
                            onSalirClick={onSalirClick}
                            onDinoSelect={onDinoSelect}
                            onHelipuertoClick={onHelipuertoClick}
                        />
                    ))}

                    {tooltip && (
                        <Label x={tooltip.x} y={tooltip.y}>
                            <Tag
                                fill="#fdfdfd"
                                stroke="#333"
                                strokeWidth={1}
                                cornerRadius={6}
                                shadowColor="black"
                                shadowBlur={5}
                                shadowOpacity={0.3}
                            />
                            <Text
                                text={tooltip.text}
                                fontSize={14}
                                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                fill="#333"
                                padding={8}
                                fontWeight="600"
                            />
                        </Label>
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default MapaJurassic;