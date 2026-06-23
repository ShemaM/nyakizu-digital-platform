import { Boxes } from "lucide-react";

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white">
        <Boxes size={18} />
      </span>
      <span className="leading-none">
        <span className="block text-[15px] font-black tracking-normal text-ink">
          Nyakizu
        </span>
        <span className="block text-[11px] font-semibold uppercase tracking-normal text-brand">
          Digital Market
        </span>
      </span>
    </span>
  );
}
