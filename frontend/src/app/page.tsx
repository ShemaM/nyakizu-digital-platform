const buyerStats = [
  { label: "Trusted suppliers", value: "2" },
  { label: "Draft lists", value: "1" },
  { label: "Active debt", value: "KES 7,000" },
];

const orderSteps = [
  "Draft",
  "Submitted",
  "Sourcing & Packing",
  "Debt Active",
  "Cleared",
];

const sellerTasks = [
  "Review submitted shopping lists",
  "Add sourced item charges",
  "Record external M-Pesa payments",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {/* Text logo for MVP: easy to maintain before a final logo mark is designed. */}
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue">
              Nyakizu Digital Market
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
              Digitizing trusted community trade.
            </h1>
          </div>
          <div className="rounded-lg border border-line bg-card px-4 py-3 text-sm text-muted">
            <p className="font-medium text-foreground">MVP focus</p>
            <p>Buyer shopping lists. Seller-controlled ledger.</p>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-line bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted">Buyer view</p>
                <h2 className="mt-1 text-2xl font-semibold">My Suppliers</h2>
              </div>
              <span className="rounded-md bg-brand-blue px-3 py-1 text-sm font-medium text-white">
                Verified
              </span>
            </div>

            <div className="mt-5 rounded-lg border border-line p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold">RNG Plaza Accessories</h3>
                  <p className="text-sm text-muted">
                    Screen protectors, covers, chargers, and sourcing requests.
                  </p>
                </div>
                <button className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white">
                  Open Store
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {buyerStats.map((stat) => (
                <div key={stat.label} className="rounded-lg bg-background p-4">
                  <p className="text-sm text-muted">{stat.label}</p>
                  <p className="mt-1 text-xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-card p-5">
            <p className="text-sm font-medium text-muted">Order lifecycle</p>
            <h2 className="mt-1 text-2xl font-semibold">Clear status tracking</h2>
            <div className="mt-5 flex flex-col gap-3">
              {orderSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-line bg-card p-5 lg:col-span-2">
            <p className="text-sm font-medium text-muted">Shopping list draft</p>
            <div className="mt-4 overflow-hidden rounded-lg border border-line">
              <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-line bg-background p-3 text-sm font-semibold">
                <span>Item</span>
                <span>Total</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-line p-3 text-sm">
                <span>Samsung A54 Privacy 3D Glass x 2</span>
                <span>KES 300</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-line p-3 text-sm">
                <span>iPhone 13 Clear Cover x 1</span>
                <span>KES 250</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-3 p-3 text-sm font-semibold">
                <span>Draft total</span>
                <span>KES 550</span>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-brand-amber bg-orange-50 p-4">
              <p className="text-sm font-semibold text-brand-amber">
                Sourcing note
              </p>
              <p className="mt-1 text-sm">
                Kindly get me two Bluetooth radios if available nearby.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-card p-5">
            <p className="text-sm font-medium text-muted">Seller controls</p>
            <h2 className="mt-1 text-2xl font-semibold">Fulfillment tasks</h2>
            <ul className="mt-5 space-y-3">
              {sellerTasks.map((task) => (
                <li key={task} className="rounded-lg bg-background p-3 text-sm">
                  {task}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted">Ledger preview</p>
              <h2 className="mt-1 text-2xl font-semibold">
                Wholesaler-controlled debt record
              </h2>
            </div>
            <span className="rounded-md bg-brand-amber px-3 py-1 text-sm font-semibold text-white">
              Debt Active
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-background p-4">
              <p className="text-sm text-muted">Final invoice</p>
              <p className="mt-1 text-xl font-semibold">KES 10,000</p>
            </div>
            <div className="rounded-lg bg-background p-4">
              <p className="text-sm text-muted">Amount received</p>
              <p className="mt-1 text-xl font-semibold text-brand-green">
                KES 3,000
              </p>
            </div>
            <div className="rounded-lg bg-background p-4">
              <p className="text-sm text-muted">Balance remaining</p>
              <p className="mt-1 text-xl font-semibold text-brand-amber">
                KES 7,000
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
