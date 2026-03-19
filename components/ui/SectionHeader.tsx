interface SectionHeaderProps {
  emoji: string;
  title: string;
  count?: number;
  countLabel?: string;
}

export default function SectionHeader({ emoji, title, count, countLabel }: SectionHeaderProps) {
  return (
    <h3 className="font-bold text-[15px] text-warm-900 mb-3 flex items-center gap-2">
      <span className="text-lg">{emoji}</span>
      {title}
      {count !== undefined && (
        <span className="text-xs text-warm-400 font-normal ml-auto">
          {count}{countLabel || '건'}
        </span>
      )}
    </h3>
  );
}
