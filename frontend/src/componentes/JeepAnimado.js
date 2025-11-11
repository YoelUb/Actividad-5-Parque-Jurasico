import React, { useState, useEffect } from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

const FRAME_PATHS = [
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_000.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_001.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_002.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_003.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_004.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_005.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_006.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_007.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_008.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_009.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_010.png',
  '/Jeep/Jeep_Green/MOVE/SOUTH/SEPARATED/Green_JEEP_CLEAN_SOUTH_011.png',
];

const SPRITE_SIZE = 48;

function JeepAnimado({ x, y, scale, onHover, onClick, pointName }) {
  const [frame, setFrame] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const [image] = useImage(FRAME_PATHS[frame]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFrame(prevFrame => (prevFrame + 1) % FRAME_PATHS.length);
    }, 100);

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
      imageSmoothingEnabled={false}
    />
  );
}

export default JeepAnimado;