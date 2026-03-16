interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ emoji = '🔍', title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-surface rounded-2xl p-8 text-center shadow-card border border-warm-50">
      <span className="text-4xl block mb-3">{emoji}</span>
      <p className="text-sm font-medium text-warm-600">{title}</p>
      {description && <p className="text-xs text-warm-300 mt-1">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="text-xs text-primary font-semibold mt-2 hover:underline">
          {action.label}
        </button>
      )}
    </div>
  );
}
