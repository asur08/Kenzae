import React from 'react';

interface FabricBadgeProps {
  label: string;
  variant?: 'emerald' | 'gold' | 'canvas' | 'stock';
  className?: string;
}

export const FabricBadge: React.FC<FabricBadgeProps> = ({
  label,
  variant = 'canvas',
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-950/90 text-gold-300 border-gold-500/30',
    gold: 'bg-gold-500/20 text-gold-700 border-gold-500/40 font-semibold',
    canvas: 'bg-canvas-subtle text-obsidian border-canvas-dark/60 font-medium',
    stock: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold',
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
