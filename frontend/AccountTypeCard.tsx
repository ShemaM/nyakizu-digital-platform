type AccountTypeCardProps = {
  icon: string;
  title: string;
  description: string;
  value: 'buyer' | 'seller';
  selectedValue: 'buyer' | 'seller' | '';
  onChange: (value: 'buyer' | 'seller') => void;
};

export function AccountTypeCard({
  icon,
  title,
  description,
  value,
  selectedValue,
  onChange,
}: AccountTypeCardProps) {
  const isSelected = selectedValue === value;
  const borderClass = isSelected ? 'border-green-500 ring-2 ring-green-500' : 'border-gray-300';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault(); // Prevent scrolling on spacebar
      onChange(value);
    }
  };

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onChange(value)}
      onKeyDown={handleKeyDown}
      className={`flex cursor-pointer items-start space-x-4 rounded-lg border ${borderClass} bg-white p-4 transition-all hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 min-h-[120px]`}
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex flex-col">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}