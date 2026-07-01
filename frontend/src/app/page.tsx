"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Logo } from "@/components/Logo";
import type { Metadata } from "next";

// ─── Counter ──────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVal(target); return; }
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      let t0 = 0;
      const tick = (now: number) => {
        if (!t0) t0 = now;
        const p = Math.min((now - t0) / duration, 1);
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { val, ref };
}

// ─── Header ──────────────────────────────────────────────────────────
function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: scrolled ? "rgba(6,15,7,0.96)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      transition: "all 0.3s",
    }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo inverted />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/login" style={{ padding: "8px 16px", fontSize: 14, fontWeight: 600, color: "#64748b", borderRadius: 10, textDecoration: "none", display: "none" }}
            className="sm-show">Sign in</Link>
          <Link href="/register" style={{
            padding: "10px 20px", fontSize: 14, fontWeight: 900, borderRadius: 12,
            background: "#C8860A", color: "#0a1f10", textDecoration: "none",
            boxShadow: "0 0 20px rgba(200,134,10,0.3)",
          }}>Jiunge</Link>
        </div>
      </div>
    </header>
  );
}

// ─── Bento hero visual ───────────────────────────────────────────────────────
function BentoPreview() {
  return (
    <div style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
      {/* Outer glow */}
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", inset: -40,
          background: "radial-gradient(ellipse at center, rgba(200,134,10,0.12) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Row 1: Order card */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16, padding: "16px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#C8860A", margin: 0 }}>Order #2047</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", margin: "2px 0 0" }}>Kamau Electronics</p>
              </div>
              <div style={{
                padding: "4px 10px", borderRadius: 20,
                background: "rgba(200,134,10,0.12)", border: "1px solid rgba(200,134,10,0.3)",
                fontSize: 10, fontWeight: 800, color: "#C8860A", textTransform: "uppercase", letterSpacing: "0.08em",
              }}>Sourcing</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["Screen guard 5\" ×20", "KES 1,200"],
                ["TPU case assorted ×12", "KES 720"],
                ["Battery 4000mAh ×10", "KES 4,500"],
              ].map(([item, price]) => (
                <div key={item} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#64748b" }}>{item}</span>
                  <span style={{ color: "#94a3b8", fontWeight: 700 }}>{price}</span>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 12, paddingTop: 12,
              borderTop: "1px solid rgba(255,255,255,0.07)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 11, color: "#334155" }}>Total</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#C8860A" }}>KES 6,420</span>
            </div>
          </div>

          {/* Row 2: Two small cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {/* Lock card */}
            <div style={{
              background: "rgba(74,222,128,0.05)",
              border: "1px solid rgba(74,222,128,0.2)",
              borderRadius: 16, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>🔒</div>
              <p style={{ fontSize: 11, fontWeight: 800, color: "#4ade80", margin: "0 0 4px" }}>Order locked</p>
              <p style={{ fontSize: 10, color: "#334155", margin: 0, lineHeight: 1.5 }}>No changes once packing starts</p>
            </div>
            {/* M-Pesa card */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 16, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>📱</div>
              <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", margin: "0 0 4px" }}>M-Pesa ref</p>
              <p style={{ fontSize: 10, fontFamily: "monospace", color: "#C8860A", margin: 0, fontWeight: 700 }}>QKL7X3R2P9</p>
            </div>
          </div>

          {/* Row 3: Ledger entry */}
          <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: "14px 18px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>✓</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Payment recorded</p>
              <p style={{ fontSize: 10, color: "#334155", margin: "2px 0 0" }}>Append-only · Cannot be modified</p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#4ade80", flexShrink: 0 }}>+6,420</span>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────
export default function HomePage() {
  const c1 = useCounter(9360);
  const c2 = useCounter(1000);
  const c3 = useCounter(3);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#e2e8f0" }}>

      {/* ══ SECTION 1 — HERO ════════════════════════════════════════════════════
          Background: deep forest green with dot grid
       ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        background: "#0a1f10",
        backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}>
        <Header />
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 24px 80px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 48, alignItems: "center" }}
            className="hero-grid">
            {/* Copy */}
            <div style={{ maxWidth: 560 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 14px", borderRadius: 100, marginBottom: 28,
                background: "rgba(200,134,10,0.08)", border: "1px solid rgba(200,134,10,0.22)",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8860A", display: "inline-block", animation: "pulse 2s infinite" }} aria-hidden="true" />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C8860A" }}>
                  Banyamulenge · RNG Plaza · Nairobi
                </span>
              </div>

              <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.02em", color: "#fff", margin: "0 0 20px" }}>
                Biashara yenu<br />
                tayari{" "}
                <span style={{ position: "relative", display: "inline-block" }}>
                  inafanya kazi
                  <span style={{ position: "absolute", bottom: 2, left: 0, right: 0, height: 3, background: "#C8860A", borderRadius: 3 }} aria-hidden="true" />
                </span>.<br />
                <span style={{ fontSize: "52%", fontWeight: 400, color: "#4a6356" }}>
                  Nyakizu inaisaidia ifanye kazi vizuri.
                </span>
              </h1>

              <p style={{ fontSize: 16, lineHeight: 1.7, color: "#64748b", margin: "0 0 32px", maxWidth: 460 }}>
                A digital layer for phone accessories traders — structured orders,
                an immutable credit ledger, and offline drafts. Built on the trust
                you already have at RNG Plaza.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <Link href="/buyer/suppliers" style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "14px 22px", borderRadius: 14, textDecoration: "none", fontWeight: 700, fontSize: 14,
                  background: "rgba(200,134,10,0.1)", border: "1px solid rgba(200,134,10,0.38)", color: "#C8860A",
                }}>
                  <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.6 }}>Mnunuzi</span>
                  Find my suppliers <span aria-hidden="true">→</span>
                </Link>
                <Link href="/seller/dashboard" style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "14px 22px", borderRadius: 14, textDecoration: "none", fontWeight: 700, fontSize: 14,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1",
                }}>
                  <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.4 }}>Muuzaji</span>
                  Manage my store <span aria-hidden="true">→</span>
                </Link>
              </div>

              <p style={{ marginTop: 18, fontSize: 12, color: "#334155", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#4ade80", fontWeight: 700 }}>✓</span>
                Works offline — draft orders without a connection
              </p>
            </div>

            {/* Bento */}
            <BentoPreview />
          </div>
        </div>
      </div>

      {/* ══ SECTION 2 — STATS ═══════════════════════════════════════════════════
          Background: near-black — creates strong depth break from hero
       ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        background: "#060f07",
        borderTop: "1px solid rgba(200,134,10,0.15)",
        borderBottom: "1px solid rgba(200,134,10,0.15)",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, textAlign: "center" }}>
          {[
            { ref: c1.ref, val: c1.val, suffix: "+", label: "Traders in network" },
            { ref: c2.ref, val: c2.val, suffix: "+", label: "SKUs per seller" },
            { ref: c3.ref, val: c3.val, suffix: " taps", label: "To complete any action" },
          ].map(({ ref, val, suffix, label }) => (
            <div key={label}>
              <p style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: "#C8860A", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                <span ref={ref}>{val}</span>{suffix}
              </p>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#1e3a2a", margin: "4px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SECTION 3 — PROBLEM ═════════════════════════════════════════════════
          Background: dark green, slightly lighter — warm texture feel
       ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        background: "#0c1f0e",
        backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 20px)",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 24px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#C8860A", margin: "0 0 12px" }}>The problem</p>
          <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", fontWeight: 900, color: "#fff", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            This is not Jumia.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "#4a6356", margin: "0 0 48px", maxWidth: 640 }}>
            Banyamulenge traders have built an extraordinary network at RNG Plaza.
            The problem has never been trust — it's been the tools.
            WhatsApp threads scroll away. Notebooks get rained on.
            M-Pesa codes live in someone's head.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {/* Before */}
            <div style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.18)", borderRadius: 20, padding: "28px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171" }} />
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#f87171" }}>Before</span>
              </div>
              {[
                "WhatsApp voice notes with order details",
                "Notebook tracking who owes what",
                "Buyer changes order while seller is packing",
                'Seller says "sina" when item may be available',
                "No signal in the market? No order possible.",
              ].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 3 }} aria-hidden="true">
                    <path d="M3 3l8 8M11 3L3 11" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: 14, color: "#64748b", lineHeight: 1.55 }}>{t}</span>
                </div>
              ))}
            </div>

            {/* After */}
            <div style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.18)", borderRadius: 20, padding: "28px 28px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "#4ade80", opacity: 0.06, filter: "blur(30px)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, position: "relative" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#4ade80" }}>With Nyakizu</span>
              </div>
              {[
                "Structured digital order — exact products, qty, notes",
                "Append-only credit ledger — no entry ever deleted",
                "Order locks at Packing stage — immutable by design",
                "Availability labels — exact stock stays private",
                "Offline drafts save locally, sync when connected",
              ].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16, position: "relative" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 3 }} aria-hidden="true">
                    <path d="M2 7.5l3.5 3.5 6.5-7" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.55, fontWeight: 500 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ SECTION 4 — HOW IT WORKS ════════════════════════════════════════════
          Background: near-black, darkest section — drama
       ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        background: "#050e06",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 24px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#C8860A", margin: "0 0 12px" }}>
            How a trade happens
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", fontWeight: 900, color: "#fff", margin: "0 0 48px", letterSpacing: "-0.02em" }}>
            Six steps, same trust.
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20, overflow: "hidden",
            background: "rgba(255,255,255,0.06)",
            gap: 1,
          }}>
            {[
              { n: "01", title: "Connect",       body: "Follow a verified wholesaler and request trusted buyer status. They approve you — just like in person." },
              { n: "02", title: "Browse",         body: "See availability labels, not exact stock numbers. The seller's inventory stays private." },
              { n: "03", title: "Order offline",  body: "Add products, quantities, and sourcing notes. Draft it offline, submit when connected." },
              { n: "04", title: "Seller locks",   body: "Once packing begins, the order is frozen. No more last-minute changes." },
              { n: "05", title: "Record M-Pesa",  body: "Both sides log the transaction reference. No fintech API — just your M-Pesa, recorded properly." },
              { n: "06", title: "Receipt",        body: "A clean, shareable record of every order and payment. The ledger is permanent." },
            ].map(({ n, title, body }) => (
              <div key={n} style={{ background: "#050e06", padding: "28px 28px" }}>
                <p style={{ fontSize: 11, fontWeight: 900, color: "#C8860A", margin: "0 0 14px", fontVariantNumeric: "tabular-nums" }}>{n}</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>{title}</p>
                <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ SECTION 5 — TRUST PILLARS ═══════════════════════════════════════════
          Background: amber-tinted dark — warmth, safety
       ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        background: "linear-gradient(180deg, #0d1c09 0%, #0a1810 100%)",
        borderBottom: "1px solid rgba(200,134,10,0.12)",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {[
            { icon: "🔐", label: "Seller verified",    desc: "National ID + photo before going live" },
            { icon: "🔒", label: "Privacy-first",      desc: "Debt records visible only to both parties" },
            { icon: "📋", label: "Append-only ledger", desc: "No entry ever modified or deleted" },
          ].map((p) => (
            <div key={p.label} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span style={{ fontSize: 20, lineHeight: 1, marginTop: 2 }}>{p.icon}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", margin: "0 0 3px" }}>{p.label}</p>
                <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SECTION 6 — FOR WHO ═════════════════════════════════════════════════
          Background: slightly lighter green — back to warmth
       ═══════════════════════════════════════════════════════════════ */}
      <div style={{ background: "#0a1f10" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 24px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#C8860A", margin: "0 0 12px" }}>Who is it for</p>
          <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", fontWeight: 900, color: "#fff", margin: "0 0 40px", letterSpacing: "-0.02em" }}>
            Everyone in the supply chain.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              { sw: "Mnunuzi", role: "Hawker / Reseller",  desc: "Order from your trusted suppliers without the phone tag. Track what you owe, download receipts, work offline.", href: "/register?r=buyer", accent: "#4ade80", cta: "Start buying" },
              { sw: "Muuzaji", role: "Wholesaler",          desc: "Manage your catalogue, approve trusted buyers, lock orders, record payments, and keep an immutable ledger.",  href: "/register?r=seller", accent: "#fbbf24", cta: "Start selling" },
            ].map((r) => (
              <div key={r.role} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "28px 28px", display: "flex", flexDirection: "column" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "5px 12px", borderRadius: 100, marginBottom: 16,
                  background: `${r.accent}14`, border: `1px solid ${r.accent}28`,
                  fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: r.accent,
                  alignSelf: "flex-start",
                }}>
                  {r.sw} · {r.role}
                </div>
                <p style={{ fontSize: 14, color: "#4a6356", lineHeight: 1.65, margin: "0 0 24px", flex: 1 }}>{r.desc}</p>
                <Link href={r.href} style={{ fontSize: 14, fontWeight: 700, color: r.accent, textDecoration: "none" }}>
                  {r.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ SECTION 7 — CTA ═════════════════════════════════════════════════════
          Background: rich gradient — the emotional peak, most alive section
       ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        background: "linear-gradient(160deg, #0f3318 0%, #061508 60%, #0a1f10 100%)",
        borderTop: "1px solid rgba(200,134,10,0.18)",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 24px", textAlign: "center", position: "relative" }}>
          <div style={{
            position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,134,10,0.14), transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
              Tayari kuanza?
            </h2>
            <p style={{ fontSize: 16, color: "#4a6356", margin: "0 auto 36px", maxWidth: 400, lineHeight: 1.65 }}>
              Free to use. No payment processing. No hidden fees.<br />Your trade — structured and protected.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              <Link href="/register" style={{
                padding: "14px 32px", borderRadius: 14, fontSize: 15, fontWeight: 900,
                background: "#C8860A", color: "#0a1f10", textDecoration: "none",
                boxShadow: "0 0 32px rgba(200,134,10,0.35)",
              }}>Create your account</Link>
              <Link href="/login" style={{
                padding: "14px 32px", borderRadius: 14, fontSize: 15, fontWeight: 600,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#64748b", textDecoration: "none",
              }}>Sign in</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive hero grid */}
      <style>{`
        @media (min-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (min-width: 640px) {
          .sm-show { display: block !important; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
