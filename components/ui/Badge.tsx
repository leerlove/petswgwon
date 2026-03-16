interface BadgeProps {
  children: React.ReactNode;
  variant?: 'condition' | 'count' | 'tag' | 'status';
  color?: string;
  active?: boolean;
  className?: string;
}

export default function Badge({ children, variant = 'tag', color, active = true, className = '' }: BadgeProps) {
  const base = 'inline-flex items-center justify-center font-semibold';

  const variants: Record<string, string> = {
    condition: `w-5 h-5 rounded-full text-[9px] border ${
      active
        ? 'bg-primary-100 text-primary-dark border-primary/30'
        : 'bg-warm-100 text-warm-300 border-warm-200'
    }`,
    count: `min-w-[18px] h-[18px] px-1 rounded-full text-[10px] leading-none`,
    tag: `px-2 py-0.5 rounded-full text-[10px] border`,
    status: `text-[10px] px-2 py-1 rounded-full font-bold backdrop-blur-sm`,
  };

  const style = color
    ? { backgroundColor: `${color}10`, color, borderColor: `${color}20` }
    : undefined;

  return (
    <span className={`${base} ${variants[variant]} ${className}`} style={style}>
      {children}
    </span>
  );
}
