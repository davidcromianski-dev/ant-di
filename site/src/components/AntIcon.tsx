import React from 'react';

interface AntIconProps {
    className?: string;
    size?: number;
}

const AntIcon: React.FC<AntIconProps> = ({ className = "", size = 64 }) => {
    return (
        <img
            src={`${process.env.PUBLIC_URL}/ant.png`}
            alt="Ant carrying injection"
            width={size}
            height={size}
            className={className}
            style={{
                backgroundColor: '#f3f4f6', // Cinza claro
                borderRadius: '8px',
                padding: '4px'
            }}
        />
    );
};

export default AntIcon;
