interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color?: string;
}

export default function StatCard({ label, value, icon, color = 'bg-amber-50 text-amber-600' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5 flex items-center gap-3 sm:gap-4">
      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-lg sm:text-xl shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
