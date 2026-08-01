import type { FC, ReactNode } from "react";

interface CardProps {
  isSelected: boolean;
  onClick: () => void;
  children: ReactNode;
}

const Card: FC<CardProps> = ({ isSelected, onClick, children }) => (
  <div
    onClick={onClick}
    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
    role="radio"
    aria-checked={isSelected}
    tabIndex={0}
    className={`w-full p-4 rounded-lg border-2 transition-all text-center cursor-pointer ${
      isSelected
        ? "border-brand-gold bg-brand-gold/10 ring-2 ring-brand-gold/50"
        : "border-slate-700 hover:border-slate-600 bg-slate-800/50"
    }`}
  >
    {children}
  </div>
);

interface RoleSelectionCardProps {
  value: "buyer" | "seller";
  label: string;
  description: string;
  icon: ReactNode;
  selection: "buyer" | "seller";
  onClick: () => void;
}

export const RoleSelectionCard: FC<RoleSelectionCardProps> = ({ value, label, description, icon, selection, onClick }) => (
  <Card isSelected={selection === value} onClick={onClick}>
    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-slate-700 mb-3 text-brand-gold">
      {icon}
    </div>
    <div className="font-semibold text-white">{label}</div>
    <div className="text-sm text-slate-400">{description}</div>
  </Card>
);

interface BusinessTypeCardProps {
  value: string;
  label: string;
  description: string;
  selection: string;
  onClick: () => void;
}

export const BusinessTypeCard: FC<BusinessTypeCardProps> = ({ value, label, description, selection, onClick }) => (
  <Card isSelected={selection === value} onClick={onClick}>
    <div className="flex items-start space-x-3 text-left">
      <div className={`mt-1 h-5 w-5 rounded-full border-2 flex-shrink-0 ${selection === value ? 'border-brand-gold bg-brand-gold' : 'border-slate-600'}`} />
      <div>
        <div className="font-semibold text-white">{label}</div>
        <div className="text-sm text-slate-400">{description}</div>
      </div>
    </div>
  </Card>
);