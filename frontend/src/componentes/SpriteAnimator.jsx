import React, { useState, useEffect, useRef } from 'react';
import './SpriteAnimator.css';

function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const SpriteAnimator = ({
    basePath,
    animations,
    animationName,
    frameCount,
    fps,
    startFrame: propStartFrame
}) => {
    const [frameIndex, setFrameIndex] = useState(0);

    let startFrame, endFrame, totalFrames;

    if (animations && animationName) {
        const animation = animations[animationName] || [1, 1];
        [startFrame, endFrame] = animation;
        totalFrames = endFrame - startFrame + 1;
    } else {
        startFrame = propStartFrame || 1;
        endFrame = frameCount ? startFrame + frameCount - 1 : 1;
        totalFrames = frameCount || 1;
    }

    useEffect(() => {
        setFrameIndex(0);
    }, [animationName, totalFrames, startFrame]);

    useInterval(() => {
        setFrameIndex((prevIndex) => (prevIndex + 1) % totalFrames);
    }, 1000 / fps);

    const getFrameUrl = (index) => {
        const frameNumber = startFrame + index;
        return `${basePath}${frameNumber}.png`;
    };

    if (!basePath) {
        return <div className="sprite-container">Animación no disponible</div>;
    }

    return (
        <div className="sprite-container">
            <img
                src={getFrameUrl(frameIndex)}
                alt="sprite-anim"
                className="sprite-image"
                onError={(e) => e.target.style.display = 'none'}
            />
        </div>
    );
};

export default SpriteAnimator;