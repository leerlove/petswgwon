interface ActionButtonRowProps {
  children: React.ReactNode;
  className?: string;
}

export default function ActionButtonRow({ children, className = '' }: ActionButtonRowProps) {
  return (
    <div className={`px-4 pb-4 flex gap-2.5 ${className}`}>
      {children}
    </div>
  );
}
