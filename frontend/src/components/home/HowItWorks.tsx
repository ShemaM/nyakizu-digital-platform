import { ClipboardList, ShieldCheck, ShoppingBag } from "lucide-react";

const STEPS = [
  {
    n: "01",
    Icon: ShieldCheck,
    tag: "Admin-verified",
    tagColor: "bg-blue-50 text-[#1A56DB]",
    iconColor: "bg-blue-50 text-[#1A56DB]",
    numColor: "bg-[#1A56DB]",
    connColor: "bg-[#1A56DB]",
    title: "Wholesaler registers and gets verified",
    body: "A wholesaler submits their store details. Our admin team reviews and approves it before it goes live to any buyer.",
  },
  {
    n: "02",
    Icon: ShoppingBag,
    tag: "Per-store trust",
    tagColor: "bg-green-50 text-green-700",
    iconColor: "bg-green-50 text-green-600",
    numColor: "bg-green-500",
    connColor: "bg-green-400",
    title: "Buyer registers and requests store access",
    body: "A buyer creates an account then requests access to a specific wholesaler's store. The wholesaler approves them directly.",
  },
  {
    n: "03",
    Icon: ClipboardList,
    tag: "Clear records",
    tagColor: "bg-amber-50 text-amber-700",
    iconColor: "bg-amber-50 text-amber-600",
    numColor: "bg-amber-400",
    connColor: "bg-transparent",
    title: "Orders flow digitally, balances stay clear",
    body: "Buyers submit structured shopping lists. Wholesalers pack and ship. Every payment and outstanding balance is tracked.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">

        {/* Header */}
        <div className="mb-16 max-w-xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#1A56DB]">
            How it works
          </p>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Three actors,<br />one clean system.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-500">
            Every relationship is approved. Every order is structured.
            Every balance is visible.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {STEPS.map(({ n, Icon, tag, tagColor, iconColor, numColor, title, body }) => (
            <div key={n} className="relative rounded-2xl border border-slate-200
              bg-white p-6 shadow-sm">

              {/* Step number chip */}
              <span className={`mb-5 inline-flex h-8 w-8 items-center
                justify-center rounded-full text-sm font-black
                text-white ${numColor}`}>
                {n}
              </span>

              {/* Icon */}
              <div className={`mb-5 inline-flex h-12 w-12 items-center
                justify-center rounded-xl ${iconColor}`}>
                <Icon size={22} strokeWidth={2} />
              </div>

              {/* Tag */}
              <span className={`mb-3 inline-block rounded-full px-2.5 py-1
                text-[11px] font-bold uppercase tracking-wide ${tagColor}`}>
                {tag}
              </span>

              <h3 className="mb-2 text-base font-bold text-slate-900">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-500">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
