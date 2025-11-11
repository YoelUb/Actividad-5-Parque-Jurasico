import React, { useState, useEffect } from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

// 1. Define la lista de fotogramas de la animación
const FRAME_PATHS = [
  '/helicoptero/separated_frames/helicopter_1.png',
  '/helicoptero/separated_frames/helicopter_2.png',
  '/helicoptero/separated_frames/helicopter_3.png',
  '/helicoptero/separated_frames/helicopter_4.png',
  '/helicoptero/separated_frames/helicopter_5.png',
  '/helicoptero/separated_frames/helicopter_6.png',
  '/helicoptero/separated_frames/helicopter_7.png',
  '/helicoptero/separated_frames/helicopter_8.png',
];

const SPRITE_SIZE = 64;

function HelicopteroAnimado({ x, y, scale, onHover, onClick, pointName }) {
  const [frame, setFrame] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const [image] = useImage(FRAME_PATHS[frame]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFrame(prevFrame => (prevFrame + 1) % FRAME_PATHS.length);
    }, 80);

    return () => clearInterval(intervalId);
  }, []);

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    onHover(true, {
      x: x + (SPRITE_SIZE / 2) * scale + 5,
      y: y,
      text: pointName
    });
    const stage = e.target.getStage();
    if (stage) stage.content.style.cursor = 'pointer';
  };

  const handleMouseLeave = (e) => {
    setIsHovered(false);
    onHover(false, null);
    const stage = e.target.getStage();
    if (stage) stage.content.style.cursor = 'default';
  };

  const currentScale = isHovered ? scale * 1.2 : scale;

  return (
    <Image
      image={image}
      x={x}
      y={y}
      scaleX={currentScale}
      scaleY={currentScale}
      offsetX={SPRITE_SIZE / 2}
      offsetY={SPRITE_SIZE / 2}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onTap={onClick}
    />
  );
}

export default HelicopteroAnimado;