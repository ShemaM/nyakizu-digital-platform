import Link from 'next/link';
import { Package, CheckCircle2, FileEdit, ArrowRight } from 'lucide-react';

interface ProductSummaryProps {
  total: number;
  active: number;
  draft: number;
}

export const ProductSummary: React.FC<ProductSummaryProps> = ({ total, active, draft }) => {
  const stats = [
    { label: "Total products", value: total, Icon: Package, color: "text-text-primary" },
    { label: "Active", value: active, Icon: CheckCircle2, color: "text-success" },
    { label: "Hidden drafts", value: draft, Icon: FileEdit, color: "text-text-muted" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-6">
      <div className="grid grid-cols-3 gap-4 flex-1">
        {stats.map(({ label, value, Icon, color }) => (
          <div key={label} className="flex flex-col items-center text-center gap-1.5 sm:items-start sm:text-left">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className={`text-2xl font-black ${color}`}>{value}</span>
            <span className="text-xs font-semibold text-text-muted leading-tight">{label}</span>
          </div>
        ))}
      </div>
      <Link
        href="/seller/dashboard/catalog"
        className="shrink-0 inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-text-secondary font-bold py-3 px-5 rounded-xl text-sm border border-slate-200 transition-colors"
      >
        View Products <ArrowRight size={14} />
      </Link>
    </div>
  );
};
