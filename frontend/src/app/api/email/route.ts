import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const FROM  = `"Nyakizu" <${process.env.SMTP_USER ?? "noreply@nyakizu.com"}>`;
const ADMIN = process.env.ADMIN_EMAIL ?? "admin@nyakizu.com";
const APP   = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function transport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   ?? "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function send(to: string, subject: string, html: string, text: string) {
  await transport().sendMail({ from: FROM, to, subject, html, text });
}

function wrap(body: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;
    background:#f8fafc;font-family:Inter,sans-serif;color:#0f172a">
    <div style="max-width:560px;margin:40px auto;padding:0 20px">
      <div style="margin-bottom:28px;display:flex;align-items:center;gap:10px">
        <div style="width:32px;height:32px;background:#1A56DB;border-radius:8px;
          display:flex;align-items:center;justify-content:center">
          <span style="color:#fff;font-weight:900;font-size:14px">N</span>
        </div>
        <span style="font-weight:700;font-size:15px">Nyakizu</span>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;
        border-radius:16px;padding:32px">${body}</div>
      <p style="font-size:11px;color:#94a3b8;text-align:center;margin-top:24px">
        © 2026 Nyakizu Digital Market
      </p>
    </div></body></html>`;
}

function btn(href: string, label: string, color = "#1A56DB") {
  return `<a href="${href}" style="display:inline-block;background:${color};
    color:#fff;text-decoration:none;font-weight:700;font-size:14px;
    padding:14px 28px;border-radius:12px;margin:20px 0">${label} →</a>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, string | string[]>;
    const { type } = body;

    switch (type) {

      case "seller_verification": {
        const { email, name, shopName, token } = body as Record<string, string>;
        const link = `${APP}/verify-email?token=${token}&role=seller`;

        await send(String(email),
          `Verify your email — ${shopName} on Nyakizu`,
          wrap(`<h2 style="margin:0 0 8px;font-size:20px">Hi ${name},</h2>
            <p style="color:#475569;margin:0 0 4px">
              Thanks for registering <strong>${shopName}</strong>.
              Please verify your email to continue.
            </p>
            ${btn(link, "Verify my email")}
            <p style="font-size:12px;color:#94a3b8;margin:0">
              Once verified, our admin team will review your store (1–2 business days).
            </p>`),
          `Hi ${name}, verify your email: ${link}`,
        );

        // notify admin
        await send(ADMIN,
          `New store pending review — ${shopName}`,
          wrap(`<h2 style="margin:0 0 12px;font-size:18px">
              New store awaiting review</h2>
            <table style="width:100%;border-collapse:collapse">
              ${[["Store", shopName], ["Owner", name], ["Email", String(email)]]
                .map(([k,v]) => `<tr>
                  <td style="padding:8px 12px;background:#f8fafc;
                    font-size:12px;color:#64748b;width:100px">${k}</td>
                  <td style="padding:8px 12px;background:#f8fafc;
                    font-size:13px;color:#0f172a">${v}</td></tr>`)
                .join("")}
            </table>
            ${btn(`${APP}/admin/sellers`, "Review in admin")}`),
          `New store: ${shopName} by ${name} <${email}>`,
        );
        return NextResponse.json({ ok: true });
      }

      case "seller_approved": {
        const { email, name, shopName } = body as Record<string, string>;
        await send(String(email),
          `Your store is live — ${shopName}`,
          wrap(`<h2 style="margin:0 0 8px;font-size:20px">You're approved, ${name}!</h2>
            <p style="color:#475569;margin:0 0 4px">
              <strong>${shopName}</strong> is now live on Nyakizu.
            </p>
            ${btn(`${APP}/dashboard`, "Go to my dashboard", "#22C55E")}`),
          `${shopName} is approved. Dashboard: ${APP}/dashboard`,
        );
        return NextResponse.json({ ok: true });
      }

      case "buyer_verification": {
        const { email, name, token } = body as Record<string, string>;
        const link = `${APP}/verify-email?token=${token}&role=buyer`;
        await send(String(email),
          "Verify your email — Nyakizu Buyer Account",
          wrap(`<h2 style="margin:0 0 8px;font-size:20px">Hi ${name},</h2>
            <p style="color:#475569;margin:0 0 4px">
              Welcome to Nyakizu. Verify your email to activate your account.
            </p>
            ${btn(link, "Verify my email", "#22C55E")}
            <p style="font-size:12px;color:#94a3b8;margin:0">
              After verifying, you can request access to wholesaler stores.
            </p>`),
          `Verify your account: ${link}`,
        );
        return NextResponse.json({ ok: true });
      }

      case "buyer_access_request": {
        const { sellerEmail, sellerName, buyerName, buyerPhone, shopName } =
          body as Record<string, string>;
        await send(String(sellerEmail),
          `New buyer access request — ${shopName}`,
          wrap(`<h2 style="margin:0 0 12px;font-size:18px">
              New access request for ${shopName}</h2>
            <table style="width:100%;border-collapse:collapse">
              ${[["Buyer", buyerName], ["Phone", buyerPhone]]
                .map(([k,v]) => `<tr>
                  <td style="padding:8px 12px;background:#f8fafc;
                    font-size:12px;color:#64748b;width:80px">${k}</td>
                  <td style="padding:8px 12px;background:#f8fafc;
                    font-size:13px;color:#0f172a">${v}</td></tr>`)
                .join("")}
            </table>
            ${btn(`${APP}/dashboard/buyers`, "Review request")}`),
          `${buyerName} (${buyerPhone}) wants access to ${shopName}`,
        );
        return NextResponse.json({ ok: true });
      }

      case "buyer_approved": {
        const { buyerEmail, buyerName, shopName, storeUrl } =
          body as Record<string, string>;
        await send(String(buyerEmail),
          `Access granted — ${shopName}`,
          wrap(`<h2 style="margin:0 0 8px;font-size:20px">Access granted!</h2>
            <p style="color:#475569;margin:0 0 4px">
              Hi ${buyerName}, <strong>${shopName}</strong> has approved your request.
            </p>
            ${btn(String(storeUrl), `Open ${shopName}`, "#22C55E")}`),
          `${shopName} approved you. Open store: ${storeUrl}`,
        );
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }
  } catch (err) {
    console.error("[email]", err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
