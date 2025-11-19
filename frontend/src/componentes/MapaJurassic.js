import React, {useRef, useState, useEffect} from 'react';
import {Stage, Layer, Image, Circle, Label, Tag, Text} from 'react-konva';
import useImage from 'use-image';

import { LOCATIONS } from './config/locations';
import { JEEP_OPTIONS } from './config/JeepOptions';

const ORIGINAL_WIDTH = 1152;
const ORIGINAL_HEIGHT = 768;

const getPreviewPath = (value, list) => {
    const item = list.find(o => o.value === value);
    return item ? item.previewPath : '';
};

const MapaImage = ({width, height}) => {
    const [image] = useImage('/mapa.png');
    return <Image image={image} width={width} height={height}/>;
};

const MapPoint = ({
    point,
    scaleX,
    scaleY,
    onHover,
    onSalirClick,
    onDinoSelect,
    onHelipuertoClick,
    onCocheClick,
    onGuardasClick,
    tooltipText
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const scaleAvg = (scaleX + scaleY) / 2;
    const scaledRadius = point.r * scaleAvg;
    const scaledX = point.x * scaleX;
    const scaledY = point.y * scaleY;

    const handleMouseEnter = (e) => {
        onHover(true, {
            x: scaledX + scaledRadius + 5,
            y: scaledY,
            text: tooltipText
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

    const handleClick = () => {
        if (point.name === "Puerta" && onSalirClick) {
            onSalirClick();
        } else if (point.dinoId && onDinoSelect) {
            onDinoSelect(point.dinoId);
        } else if (point.name === "Helipuerto" && onHelipuertoClick) {
            onHelipuertoClick();
        } else if (point.name === "Coche" && onCocheClick) {
            onCocheClick();
        } else if (point.name === "Guardas" && onGuardasClick) {
            onGuardasClick();
        }
    };

    return (
        <Circle
            x={scaledX}
            y={scaledY}
            radius={isHovered ? scaledRadius * 1.2 : scaledRadius}
            fill="#ff4136"
            stroke="#ffffff"
            strokeWidth={2}
            shadowBlur={isHovered ? 10 : 5}
            shadowColor="black"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        />
    );
};

const MapaJurassic = ({
    onSalirClick,
    onDinoSelect,
    onHelipuertoClick,
    onCocheClick,
    onGuardasClick,
    assetConfig,
    dinos
}) => {
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
        if (isVisible) setTooltip(data);
        else setTooltip(null);
    };

    const scaleX = size.width / ORIGINAL_WIDTH;
    const scaleY = size.height / ORIGINAL_HEIGHT;

    const getDinoNameForLocation = (loc) => {
        if (loc.dinoId && dinos && Array.isArray(dinos)) {
            const currentDino = dinos.find(d => d.dino_id_str === loc.dinoId);
            return currentDino ? `${loc.name}: ${currentDino.nombre}` : loc.name;
        }
        return loc.name;
    };

    return (
        <div
            ref={wrapperRef}
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

                    {LOCATIONS.map((loc) => (
                        <React.Fragment key={loc.name}>
                            <MapPoint
                                point={loc}
                                scaleX={scaleX}
                                scaleY={scaleY}
                                onHover={handlePointHover}
                                onSalirClick={onSalirClick}
                                onDinoSelect={onDinoSelect}
                                onHelipuertoClick={onHelipuertoClick}
                                onCocheClick={onCocheClick}
                                onGuardasClick={onGuardasClick}
                                tooltipText={getDinoNameForLocation(loc)}
                            />
                        </React.Fragment>
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
