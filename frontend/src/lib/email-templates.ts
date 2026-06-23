const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3003";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "support@nyakizu.com";

// ─── seller verification ──────────────────────────────────────────────────────

export function sellerVerificationEmail(opts: {
  name: string;
  shopName: string;
  token: string;
}) {
  const link = `${BASE_URL}/verify-email?token=${opts.token}&role=seller`;
  return {
    subject: `Verify your email — ${opts.shopName} on Nyakizu`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1c;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#fff;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">

    <div style="margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <div style="width:32px;height:32px;background:#1A56DB;border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-weight:900;font-size:14px;">N</span>
        </div>
        <span style="font-weight:700;font-size:15px;color:#fff;">Nyakizu</span>
      </div>
    </div>

    <div style="background:#111827;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;">
      <p style="font-size:22px;font-weight:900;margin:0 0 8px;">Hi ${opts.name},</p>
      <p style="font-size:14px;color:rgba(255,255,255,0.5);margin:0 0 24px;line-height:1.6;">
        Thanks for registering <strong style="color:#fff;">${opts.shopName}</strong> on Nyakizu.
        Please verify your email address to continue.
      </p>

      <a href="${link}"
        style="display:inline-block;background:#1A56DB;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:12px;margin-bottom:24px;">
        Verify my email →
      </a>

      <p style="font-size:12px;color:rgba(255,255,255,0.3);margin:0 0 8px;line-height:1.6;">
        Once verified, our admin team will review your store and notify you by email.
        This usually takes 1–2 business days.
      </p>
      <p style="font-size:12px;color:rgba(255,255,255,0.2);margin:0;">
        If you didn't create this account, ignore this email.
      </p>
    </div>

    <p style="font-size:11px;color:rgba(255,255,255,0.2);text-align:center;margin-top:24px;">
      © 2026 Nyakizu Digital Market · <a href="mailto:${SUPPORT_EMAIL}" style="color:rgba(255,255,255,0.3);">${SUPPORT_EMAIL}</a>
    </p>
  </div>
</body>
</html>`,
    text: `Hi ${opts.name},\n\nVerify your email for ${opts.shopName}: ${link}\n\nOnce verified, our admin team will review your store (1–2 business days).\n\nNyakizu`,
  };
}

// ─── admin notification: new seller pending ───────────────────────────────────

export function adminNewSellerEmail(opts: {
  adminEmail: string;
  sellerName: string;
  shopName: string;
  shopLocation: string;
  categories: string[];
  sellerEmail: string;
  sellerPhone: string;
}) {
  const reviewUrl = `${BASE_URL}/admin/sellers`;
  return {
    subject: `New seller pending review — ${opts.shopName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0f1c;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#fff;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="background:#111827;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;">
      <p style="font-size:16px;font-weight:900;margin:0 0 4px;">New store awaiting review</p>
      <p style="font-size:13px;color:rgba(255,255,255,0.4);margin:0 0 24px;">A new wholesaler has registered and verified their email.</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        ${[
          ["Store name", opts.shopName],
          ["Owner", opts.sellerName],
          ["Location", opts.shopLocation],
          ["Categories", opts.categories.join(", ")],
          ["Email", opts.sellerEmail],
          ["Phone", opts.sellerPhone],
        ].map(([label, value]) => `
        <tr>
          <td style="padding:8px 12px;background:rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.06);font-size:12px;color:rgba(255,255,255,0.4);width:120px;">${label}</td>
          <td style="padding:8px 12px;background:rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px;color:#fff;">${value}</td>
        </tr>`).join("")}
      </table>

      <a href="${reviewUrl}"
        style="display:inline-block;background:#1A56DB;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;">
        Review in admin panel →
      </a>
    </div>
  </div>
</body>
</html>`,
    text: `New seller pending review:\nStore: ${opts.shopName}\nOwner: ${opts.sellerName}\nLocation: ${opts.shopLocation}\nEmail: ${opts.sellerEmail}\nPhone: ${opts.sellerPhone}\n\nReview: ${reviewUrl}`,
  };
}

// ─── seller approved ──────────────────────────────────────────────────────────

export function sellerApprovedEmail(opts: { name: string; shopName: string }) {
  const dashboardUrl = `${BASE_URL}/dashboard`;
  return {
    subject: `Your store is live — ${opts.shopName} is now on Nyakizu`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0f1c;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#fff;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="background:#111827;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;">
      <div style="width:56px;height:56px;background:rgba(34,197,94,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
        <span style="font-size:24px;">✓</span>
      </div>
      <p style="font-size:22px;font-weight:900;margin:0 0 8px;">You're approved, ${opts.name}!</p>
      <p style="font-size:14px;color:rgba(255,255,255,0.5);margin:0 0 24px;line-height:1.6;">
        <strong style="color:#fff;">${opts.shopName}</strong> is now live on Nyakizu.
        You can set up your catalog and start accepting buyers.
      </p>

      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.3);margin:0 0 12px;">Next steps</p>
        ${["Sign in and complete your catalog", "Share your store link with trusted buyers", "Approve buyer requests as they come in"].map((s) =>
          `<p style="font-size:13px;color:rgba(255,255,255,0.6);margin:0 0 8px;">✓ ${s}</p>`
        ).join("")}
      </div>

      <a href="${dashboardUrl}"
        style="display:inline-block;background:#1A56DB;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:12px;">
        Go to my dashboard →
      </a>
    </div>
  </div>
</body>
</html>`,
    text: `Your store ${opts.shopName} is approved! Sign in at ${dashboardUrl} to set up your catalog.\n\nNyakizu`,
  };
}

// ─── buyer verification ───────────────────────────────────────────────────────

export function buyerVerificationEmail(opts: { name: string; token: string }) {
  const link = `${BASE_URL}/verify-email?token=${opts.token}&role=buyer`;
  return {
    subject: "Verify your email — Nyakizu Buyer Account",
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0f1c;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#fff;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="background:#111827;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;">
      <p style="font-size:22px;font-weight:900;margin:0 0 8px;">Hi ${opts.name},</p>
      <p style="font-size:14px;color:rgba(255,255,255,0.5);margin:0 0 24px;line-height:1.6;">
        Welcome to Nyakizu. Click below to verify your email and activate your buyer account.
      </p>

      <a href="${link}"
        style="display:inline-block;background:#22C55E;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:12px;margin-bottom:24px;">
        Verify my email →
      </a>

      <p style="font-size:12px;color:rgba(255,255,255,0.3);margin:0;line-height:1.6;">
        After verifying, you can browse verified wholesale stores and request access to order from them.
        Each wholesaler must approve you before you can place orders.
      </p>
    </div>
    <p style="font-size:11px;color:rgba(255,255,255,0.2);text-align:center;margin-top:24px;">
      © 2026 Nyakizu Digital Market
    </p>
  </div>
</body>
</html>`,
    text: `Hi ${opts.name},\n\nVerify your Nyakizu buyer account: ${link}\n\nNyakizu`,
  };
}

// ─── buyer access request → wholesaler ───────────────────────────────────────

export function buyerAccessRequestEmail(opts: {
  sellerName: string;
  sellerEmail: string;
  buyerName: string;
  buyerPhone: string;
  buyerBizType: string;
  shopName: string;
}) {
  const reviewUrl = `${BASE_URL}/dashboard/buyers`;
  return {
    subject: `New buyer request for ${opts.shopName} — ${opts.buyerName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0f1c;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#fff;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="background:#111827;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;">
      <p style="font-size:16px;font-weight:900;margin:0 0 4px;">New buyer access request</p>
      <p style="font-size:13px;color:rgba(255,255,255,0.4);margin:0 0 24px;">
        Someone wants to order from <strong style="color:#fff;">${opts.shopName}</strong>.
      </p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        ${[
          ["Buyer name", opts.buyerName],
          ["Phone", opts.buyerPhone],
          ["Business type", opts.buyerBizType],
        ].map(([label, value]) => `
        <tr>
          <td style="padding:8px 12px;background:rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.06);font-size:12px;color:rgba(255,255,255,0.4);width:120px;">${label}</td>
          <td style="padding:8px 12px;background:rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px;color:#fff;">${value}</td>
        </tr>`).join("")}
      </table>

      <a href="${reviewUrl}"
        style="display:inline-block;background:#1A56DB;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;">
        Approve or deny in dashboard →
      </a>
    </div>
  </div>
</body>
</html>`,
    text: `New buyer request for ${opts.shopName}:\nBuyer: ${opts.buyerName}\nPhone: ${opts.buyerPhone}\nBusiness: ${opts.buyerBizType}\n\nReview: ${reviewUrl}`,
  };
}

// ─── buyer approved by wholesaler ────────────────────────────────────────────

export function buyerApprovedEmail(opts: {
  buyerName: string;
  shopName: string;
  storeUrl: string;
}) {
  return {
    subject: `Access granted — you can now order from ${opts.shopName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0f1c;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#fff;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="background:#111827;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;">
      <p style="font-size:22px;font-weight:900;margin:0 0 8px;">Access granted!</p>
      <p style="font-size:14px;color:rgba(255,255,255,0.5);margin:0 0 24px;line-height:1.6;">
        Hi ${opts.buyerName}, <strong style="color:#fff;">${opts.shopName}</strong> has approved your access.
        You can now browse their catalog and submit shopping lists.
      </p>
      <a href="${opts.storeUrl}"
        style="display:inline-block;background:#22C55E;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:12px;">
        Open ${opts.shopName} →
      </a>
    </div>
  </div>
</body>
</html>`,
    text: `Hi ${opts.buyerName}, ${opts.shopName} has approved your access. Open their store: ${opts.storeUrl}\n\nNyakizu`,
  };
}
