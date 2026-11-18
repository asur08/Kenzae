import React from 'react';

interface FabricBadgeProps {
  label: string;
  variant?: 'maroon' | 'emerald' | 'gold' | 'canvas' | 'stock';
  className?: string;
}

export const FabricBadge: React.FC<FabricBadgeProps> = ({
  label,
  variant = 'canvas',
  className = '',
}) => {
  const variantStyles = {
    maroon: 'bg-maroon-950/90 text-brass-light border-brass/30',
    emerald: 'bg-maroon-950/90 text-brass-light border-brass/30',
    gold: 'bg-brass/20 text-brass-dark border-brass/40 font-semibold',
    canvas: 'bg-canvas-subtle text-obsidian border-canvas-border font-medium',
    stock: 'bg-maroon-100 text-maroon-900 border-maroon-200 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border transition-colors ${variantStyles[variant]} ${className}`}
    >
      {label}
    </span>
  );
};

export default FabricBadge;
