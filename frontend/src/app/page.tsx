"use client";

import { useEffect, useId, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Cloud,
  Lock,
  Package,
  ShoppingBag,
  Store,
  Wallet,
  WifiOff,
  X,
} from "lucide-react";

type Role = "buyer" | "seller";
type Step = "role" | "account" | "details" | "done";

interface AccountFields {
  fullName: string;
  phone: string;
  password: string;
}

interface BuyerFields {
  location: string;
  mainSupplier: string;
  businessType: string;
}

interface SellerFields {
  shopName: string;
  location: string;
  categories: string[];
}

const categoryOptions = [
  "Screen protectors",
  "Phone covers",
  "Chargers",
  "Cables",
  "Batteries",
  "Speakers",
];

const businessTypes = ["Hawker", "Reseller", "Small shop", "Repair shop"];

const baseInput =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const roleConfig = {
  buyer: {
    label: "Buyer",
    title: "Buy from trusted wholesalers",
    description:
      "Browse approved suppliers, draft orders, track balances, and save work for weak-network days.",
    icon: ShoppingBag,
    cta: "Continue as Buyer",
  },
  seller: {
    label: "Wholesaler",
    title: "Sell and manage orders",
    description:
      "List products, manage buyer relationships, record M-Pesa payments, and control stock visibility.",
    icon: Store,
    cta: "Continue as Seller",
  },
} satisfies Record<Role, {
  label: string;
  title: string;
  description: string;
  icon: typeof ShoppingBag;
  cta: string;
}>;

const trustedSuppliers = [
  { name: "RNG Plaza Accessories", status: "Trusted", balance: "KES 7,000" },
  { name: "Espoir Mobile", status: "Approved", balance: "KES 0" },
];

const orderItems = [
  { name: "Samsung A54 privacy glass", qty: "x2", total: "KES 300" },
  { name: "iPhone 13 clear cover", qty: "x1", total: "KES 250" },
  { name: "65W Type-C charger", qty: "x1", total: "KES 450" },
];

function AppLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/20">
        <span className="text-sm font-black text-white">N</span>
      </div>
      <div>
        <p className={`text-sm font-black leading-none ${inverted ? "text-white" : "text-slate-950"}`}>
          Nyakizu
        </p>
        <p className={`mt-1 text-[10px] font-semibold uppercase tracking-widest ${inverted ? "text-white/35" : "text-slate-400"}`}>
          Digital Market
        </p>
      </div>
    </div>
  );
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
      <CheckCircle2 size={13} />
      {children}
    </span>
  );
}

function StepIndicator({ step, role }: { step: Step; role: Role | null }) {
  const steps = [
    { id: "role", label: "Role" },
    { id: "account", label: "Account" },
    { id: "details", label: role === "seller" ? "Shop" : "Buyer" },
  ] as const;
  const currentIndex = Math.max(
    0,
    steps.findIndex((item) => item.id === step),
  );

  return (
    <div className="grid grid-cols-3 gap-2">
      {steps.map((item, index) => {
        const active = index <= currentIndex || step === "done";
        return (
          <div key={item.id} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`hidden text-xs font-bold sm:inline ${
                active ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RoleChoice({
  selectedRole,
  setSelectedRole,
  onNext,
}: {
  selectedRole: Role | null;
  setSelectedRole: (role: Role) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Create account
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
          Start as a buyer or a wholesaler
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Nyakizu opens the right tools based on your role. You can add the
          other role later after verification.
        </p>
      </div>

      <div className="grid gap-3">
        {(["buyer", "seller"] as Role[]).map((role) => {
          const Icon = roleConfig[role].icon;
          const active = selectedRole === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`group flex min-h-32 items-start gap-4 rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100"
                  : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                <Icon size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-slate-950">
                    {roleConfig[role].label}
                  </p>
                  {active && <CheckCircle2 size={18} className="text-blue-600" />}
                </div>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {roleConfig[role].title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {roleConfig[role].description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!selectedRole}
        onClick={onNext}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-950/15 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
      >
        {selectedRole ? roleConfig[selectedRole].cta : "Choose a role"}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function AccountForm({
  account,
  setAccount,
  onBack,
  onNext,
}: {
  account: AccountFields;
  setAccount: (patch: Partial<AccountFields>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const id = useId();
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!account.fullName.trim()) return setError("Enter your full name.");
    if (!account.phone.trim()) return setError("Enter your phone number.");
    if (account.password.length < 6) {
      return setError("Use at least 6 characters for your password.");
    }
    setError("");
    onNext();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Account details
        </p>
        <h2 className="mt-3 text-2xl font-black text-slate-950">
          Set up your login
        </h2>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">
          <X size={15} />
          {error}
        </div>
      )}

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Full name
        </span>
        <input
          id={`${id}-name`}
          className={`${baseInput} mt-1.5`}
          value={account.fullName}
          onChange={(event) => setAccount({ fullName: event.target.value })}
          placeholder="e.g. Claudine Mutesi"
          type="text"
        />
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Phone number
        </span>
        <input
          id={`${id}-phone`}
          className={`${baseInput} mt-1.5`}
          value={account.phone}
          onChange={(event) => setAccount({ phone: event.target.value })}
          placeholder="07XX XXX XXX"
          type="tel"
        />
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Password
        </span>
        <input
          id={`${id}-password`}
          autoComplete="new-password"
          className={`${baseInput} mt-1.5`}
          value={account.password}
          onChange={(event) => setAccount({ password: event.target.value })}
          placeholder="At least 6 characters"
          type="password"
        />
      </label>

      <div className="grid grid-cols-[auto_1fr] gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          aria-label="Go back"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-950/15 transition hover:bg-blue-700"
        >
          Continue
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}

function BuyerDetailsForm({
  buyer,
  setBuyer,
  onBack,
  onDone,
}: {
  buyer: BuyerFields;
  setBuyer: (patch: Partial<BuyerFields>) => void;
  onBack: () => void;
  onDone: () => void;
}) {
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!buyer.location.trim()) return setError("Enter where you sell from.");
    if (!buyer.businessType) return setError("Choose how you trade.");
    setError("");
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Buyer profile
        </p>
        <h2 className="mt-3 text-2xl font-black text-slate-950">
          Tell suppliers how you buy
        </h2>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">
          <X size={15} />
          {error}
        </div>
      )}

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Selling area
        </span>
        <input
          className={`${baseInput} mt-1.5`}
          value={buyer.location}
          onChange={(event) => setBuyer({ location: event.target.value })}
          placeholder="e.g. Eastleigh, Nairobi"
          type="text"
        />
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Usual supplier
        </span>
        <input
          className={`${baseInput} mt-1.5`}
          value={buyer.mainSupplier}
          onChange={(event) => setBuyer({ mainSupplier: event.target.value })}
          placeholder="Optional: supplier name or shop"
          type="text"
        />
      </label>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          How do you trade?
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {businessTypes.map((type) => {
            const active = buyer.businessType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setBuyer({ businessType: type })}
                className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
                  active
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          aria-label="Go back"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-950/15 transition hover:bg-blue-700"
        >
          Create buyer account
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}

function SellerDetailsForm({
  seller,
  setSeller,
  onBack,
  onDone,
}: {
  seller: SellerFields;
  setSeller: (patch: Partial<SellerFields>) => void;
  onBack: () => void;
  onDone: () => void;
}) {
  const [error, setError] = useState("");

  function toggleCategory(category: string) {
    setSeller({
      categories: seller.categories.includes(category)
        ? seller.categories.filter((item) => item !== category)
        : [...seller.categories, category],
    });
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!seller.shopName.trim()) return setError("Enter your shop name.");
    if (!seller.location.trim()) return setError("Enter your shop location.");
    if (!seller.categories.length) return setError("Choose what you sell.");
    setError("");
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Wholesaler profile
        </p>
        <h2 className="mt-3 text-2xl font-black text-slate-950">
          Register your shop
        </h2>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">
          <X size={15} />
          {error}
        </div>
      )}

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Shop name
        </span>
        <input
          className={`${baseInput} mt-1.5`}
          value={seller.shopName}
          onChange={(event) => setSeller({ shopName: event.target.value })}
          placeholder="e.g. RNG Plaza Accessories"
          type="text"
        />
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Shop location
        </span>
        <input
          className={`${baseInput} mt-1.5`}
          value={seller.location}
          onChange={(event) => setSeller({ location: event.target.value })}
          placeholder="e.g. Luthuli Avenue, Nairobi"
          type="text"
        />
      </label>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Categories
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {categoryOptions.map((category) => {
            const active = seller.categories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                  active
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          aria-label="Go back"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-950/15 transition hover:bg-blue-700"
        >
          Submit for verification
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}

function DoneState({
  role,
  account,
  buyer,
  seller,
  reset,
}: {
  role: Role;
  account: AccountFields;
  buyer: BuyerFields;
  seller: SellerFields;
  reset: () => void;
}) {
  const headline =
    role === "seller" ? "Shop verification requested" : "Buyer account created";
  const body =
    role === "seller"
      ? `${seller.shopName} is queued for review. We will call ${account.fullName.split(" ")[0] || "you"} on ${account.phone}.`
      : `Your buyer workspace is ready for ${buyer.location}. Start with your trusted suppliers.`;

  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <CheckCircle2 size={34} />
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-950">{headline}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Next inside the app
        </p>
        <div className="mt-3 space-y-3">
          {(role === "seller"
            ? ["Admin verification", "Product catalog setup", "Buyer approval list"]
            : ["Find trusted supplier", "Draft first order", "Track credit balance"]
          ).map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CheckCircle2 size={15} className="text-emerald-600" />
              {item}
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={reset}
        className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
      >
        Create another account
      </button>
    </div>
  );
}

function OnboardingPanel({
  role,
  setRole,
  step,
  setStep,
  account,
  setAccount,
  buyer,
  setBuyer,
  seller,
  setSeller,
  reset,
}: {
  role: Role | null;
  setRole: (role: Role) => void;
  step: Step;
  setStep: (step: Step) => void;
  account: AccountFields;
  setAccount: (patch: Partial<AccountFields>) => void;
  buyer: BuyerFields;
  setBuyer: (patch: Partial<BuyerFields>) => void;
  seller: SellerFields;
  setSeller: (patch: Partial<SellerFields>) => void;
  reset: () => void;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/10 sm:p-6">
      <StepIndicator step={step} role={role} />
      <div className="mt-7">
        {step === "role" && (
          <RoleChoice
            selectedRole={role}
            setSelectedRole={setRole}
            onNext={() => setStep("account")}
          />
        )}
        {step === "account" && (
          <AccountForm
            account={account}
            setAccount={setAccount}
            onBack={() => setStep("role")}
            onNext={() => setStep("details")}
          />
        )}
        {step === "details" && role === "buyer" && (
          <BuyerDetailsForm
            buyer={buyer}
            setBuyer={setBuyer}
            onBack={() => setStep("account")}
            onDone={() => setStep("done")}
          />
        )}
        {step === "details" && role === "seller" && (
          <SellerDetailsForm
            seller={seller}
            setSeller={setSeller}
            onBack={() => setStep("account")}
            onDone={() => setStep("done")}
          />
        )}
        {step === "done" && role && (
          <DoneState
            role={role}
            account={account}
            buyer={buyer}
            seller={seller}
            reset={reset}
          />
        )}
      </div>
    </section>
  );
}

function BuyerPreview() {
  return (
    <div className="rounded-[2rem] border border-slate-800 bg-slate-950 p-4 text-white shadow-2xl shadow-slate-950/25">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300">
            Buyer workspace
          </p>
          <p className="mt-1 text-lg font-black">My Suppliers</p>
        </div>
        <StatusPill>Offline ready</StatusPill>
      </div>

      <div className="mt-4 grid gap-3">
        {trustedSuppliers.map((supplier) => (
          <div key={supplier.name} className="rounded-2xl bg-white/[0.06] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold">{supplier.name}</p>
                <p className="mt-1 text-xs text-white/35">{supplier.status}</p>
              </div>
              <p className="text-xs font-black text-amber-300">{supplier.balance}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 text-slate-950">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
              Draft order
            </p>
            <p className="mt-1 text-sm font-black">RNG Plaza Accessories</p>
          </div>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-700">
            Saved offline
          </span>
        </div>
        <div className="mt-3 space-y-2">
          {orderItems.map((item) => (
            <div key={item.name} className="grid grid-cols-[1fr_auto] gap-3 rounded-xl bg-slate-50 p-3">
              <div>
                <p className="text-xs font-bold">{item.name}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{item.qty}</p>
              </div>
              <p className="text-xs font-black">{item.total}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SellerPreview() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/10">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
            Wholesaler workspace
          </p>
          <p className="mt-1 text-lg font-black text-slate-950">Today</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Store size={20} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Orders", value: "12" },
          { label: "Debt", value: "9.4k" },
          { label: "Paid", value: "6.2k" },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl bg-slate-50 p-3 text-center">
            <p className="text-lg font-black text-slate-950">{metric.value}</p>
            <p className="text-[10px] font-bold uppercase text-slate-400">
              {metric.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {[
          { icon: Package, title: "Samsung A54 glass", meta: "Can be sourced" },
          { icon: Lock, title: "Order #1048", meta: "Packing locked" },
          { icon: Wallet, title: "M-Pesa record", meta: "KES 3,000 received" },
        ].map(({ icon: Icon, title, meta }) => (
          <div key={title} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Icon size={18} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-950">{title}</p>
              <p className="text-xs text-slate-500">{meta}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppPreviewGrid() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:px-6 lg:grid-cols-4">
        {[
          {
            icon: BadgeCheck,
            title: "Verified roles",
            body: "Buyer and wholesaler access stay separate for safer workflows.",
          },
          {
            icon: ClipboardList,
            title: "Structured orders",
            body: "Shopping lists become clear order records with statuses.",
          },
          {
            icon: BookOpen,
            title: "Credit ledger",
            body: "Pay-later balances and partial payments remain visible.",
          },
          {
            icon: Cloud,
            title: "PWA ready",
            body: "Installable, mobile-first, and prepared for offline sync.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600">
              <Icon size={19} />
            </div>
            <h3 className="mt-4 text-sm font-black text-slate-950">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState<Step>("role");
  const [account, setAccountState] = useState<AccountFields>({
    fullName: "",
    phone: "",
    password: "",
  });
  const [buyer, setBuyerState] = useState<BuyerFields>({
    location: "",
    mainSupplier: "",
    businessType: "",
  });
  const [seller, setSellerState] = useState<SellerFields>({
    shopName: "",
    location: "",
    categories: [],
  });

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  function reset() {
    setRole(null);
    setStep("role");
    setAccountState({ fullName: "", phone: "", password: "" });
    setBuyerState({ location: "", mainSupplier: "", businessType: "" });
    setSellerState({ shopName: "", location: "", categories: [] });
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <AppLogo />
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 sm:inline-flex">
              <WifiOff size={13} />
              Offline drafts
            </span>
            <a
              href="#signup"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-950/10 transition hover:bg-blue-700"
            >
              Sign up
            </a>
          </div>
        </div>
      </header>

      <section id="signup" className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:py-10">
        <div className="flex flex-col gap-6">
          <section className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-500/15 px-3 py-1.5 text-xs font-bold text-blue-200">
                Installable PWA
              </span>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-200">
                Built for trusted trade
              </span>
            </div>
            <h1 className="mt-8 max-w-2xl text-4xl font-black leading-[1.03] tracking-tight sm:text-6xl">
              Your community trade app starts with the right role.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">
              Nyakizu is a mobile-first workspace for phone accessories trade:
              trusted suppliers, buyer orders, seller fulfillment, M-Pesa
              records, and credit tracking in one app.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Buyer", "Find trusted suppliers"],
                ["Seller", "Manage orders"],
                ["Admin", "Verify shops later"],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm font-black">{title}</p>
                  <p className="mt-1 text-xs text-white/40">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <BuyerPreview />
            <SellerPreview />
          </div>
        </div>

        <OnboardingPanel
          role={role}
          setRole={setRole}
          step={step}
          setStep={setStep}
          account={account}
          setAccount={(patch) => setAccountState((current) => ({ ...current, ...patch }))}
          buyer={buyer}
          setBuyer={(patch) => setBuyerState((current) => ({ ...current, ...patch }))}
          seller={seller}
          setSeller={(patch) => setSellerState((current) => ({ ...current, ...patch }))}
          reset={reset}
        />
      </section>

      <AppPreviewGrid />

      <footer className="bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <AppLogo inverted />
          <p className="text-xs font-semibold text-white/40">
            Digitizing trusted community trade.
          </p>
        </div>
      </footer>
    </main>
  );
}
