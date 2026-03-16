interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
  animationDelay?: number;
}

export default function Card({ children, className = '', onClick, animated = false, animationDelay = 0 }: CardProps) {
  const base = 'bg-surface rounded-2xl shadow-card border border-warm-100 overflow-hidden';
  const interactive = onClick ? 'hover:shadow-card-hover transition-shadow press-scale cursor-pointer' : '';
  const animation = animated ? 'animate-fade-in-up' : '';

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`${base} ${interactive} ${animation} ${className}`}
      onClick={onClick}
      style={animated ? { animationDelay: `${animationDelay}ms`, animationFillMode: 'both' } : undefined}
    >
      {children}
    </Component>
  );
}
