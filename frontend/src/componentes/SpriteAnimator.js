import React from 'react';
import './SpriteAnimator.css';

const SpriteAnimator = ({ spriteSheet, frameCount, frameWidth, frameHeight }) => {

    const style = {
        '--sprite-sheet': `url(${spriteSheet})`,
        '--frame-width': `${frameWidth}px`,
        '--frame-height': `${frameHeight}px`,
        '--frame-count': frameCount,
        '--sprite-sheet-width': `${frameWidth * frameCount}px`,
    };

    return (
        <div
            className="sprite-animator"
            style={style}
        >
        </div>
    );
};

export default SpriteAnimator;