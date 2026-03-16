interface ChipProps {
  label: string;
  active?: boolean;
  color?: string;
  onClick?: () => void;
  className?: string;
}

export default function Chip({ label, active = false, color, onClick, className = '' }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border shrink-0 press-scale ${
        active
          ? 'text-white shadow-sm'
          : 'bg-surface text-warm-600 hover:bg-warm-100'
      } ${className}`}
      style={
        active && color
          ? { backgroundColor: color, borderColor: color }
          : !active && color
          ? { borderColor: color + '40' }
          : active
          ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' }
          : { borderColor: 'var(--color-warm-200)' }
      }
    >
      {label}
    </button>
  );
}
