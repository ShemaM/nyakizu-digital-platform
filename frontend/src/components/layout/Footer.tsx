import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-body sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo />
        <p>Built for trusted phone accessories trade in Kenya.</p>
      </div>
    </footer>
  );
}
