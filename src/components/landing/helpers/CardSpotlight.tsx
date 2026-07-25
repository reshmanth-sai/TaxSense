import React, { useRef, useState } from 'react';

interface CardSpotlightProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export const CardSpotlight: React.FC<CardSpotlightProps> = ({ 
  children, 
  className = "",
  glowColor = "rgba(59, 130, 246, 0.08)"
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-500 z-10"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 65%)`,
        }}
      />
      {children}
    </div>
  );
};
