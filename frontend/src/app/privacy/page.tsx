import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LandingHeader, LandingFooter, Container, Section } from "@/components/layouts";
import { SITE_URL } from "@/lib/seo";
import { SUPPORT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Nyakizu Digital Market collects, uses, and protects your information.",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

const LAST_UPDATED = "10 August 2026";

function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-dark-accent py-8 first:pt-0 last:border-b-0 last:pb-0">
      <h2 className="text-xl font-bold text-text-primary mb-3">{title}</h2>
      <div className="space-y-3 text-text-secondary leading-relaxed">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-text-primary">
      <LandingHeader />

      <Section spacing="lg" className="pt-32 sm:pt-40">
        <Container size="sm">
          <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
              Privacy Policy
            </h1>
            <p className="mt-3 text-text-secondary">Last updated {LAST_UPDATED}</p>
          </div>

          <div className="rounded-2xl border border-dark-accent bg-white px-6 sm:px-8">
            <PolicySection title="1. What this covers">
              <p>
                Nyakizu Digital Market (&quot;Nyakizu&quot;, &quot;we&quot;, &quot;us&quot;) is a community platform
                that helps phone accessories wholesalers and resellers manage orders and debts. This
                page explains what information we collect when you use the platform, why we collect
                it, and how we protect it.
              </p>
            </PolicySection>

            <PolicySection title="2. Information we collect">
              <p>When you create an account, we collect:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Your name, username, email address, and phone number</li>
                <li>Your location and, for sellers, your store name and details</li>
                <li>A password, which we never store in plain text</li>
                <li>An optional profile photo, if you choose to add one</li>
              </ul>
              <p>
                As you use the platform, we also store the orders, products, and payment records you
                and the people you trade with create. This is the core record-keeping the platform
                is built to provide.
              </p>
            </PolicySection>

            <PolicySection title="3. How we use your information">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>To create and secure your account, including verifying your email address</li>
                <li>To let buyers and sellers place, track, and fulfil orders with each other</li>
                <li>To send you emails about your account and your orders, like verification links, order status updates, and approval decisions</li>
                <li>To keep the platform safe, including reviewing new seller accounts before they go live</li>
              </ul>
              <p>We do not sell your information to anyone, for any reason.</p>
            </PolicySection>

            <PolicySection title="4. Who can see your information">
              <p>
                A buyer only sees a seller&apos;s product catalog and prices after that seller approves
                their request to order. Sellers control who they trade with. Exact stock quantities
                are never shown to buyers, only whether an item is available. This is on purpose, to
                protect how sellers source their stock.
              </p>
              <p>
                Order and payment details are visible only to the buyer and seller involved in that
                order, and to platform administrators reviewing account approvals or resolving a
                dispute.
              </p>
            </PolicySection>

            <PolicySection title="5. Cookies">
              <p>
                We use two cookies, both required for the platform to work: one keeps you signed in,
                and one protects your account from cross-site request forgery. We do not use
                advertising or tracking cookies, and no third-party analytics scripts run on this
                site.
              </p>
            </PolicySection>

            <PolicySection title="6. Third-party services">
              <p>A few outside services help run the platform. They only handle what they need for their job:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Cloud hosting providers, to run the website and store its database</li>
                <li>An email delivery service, to send verification links and order notifications</li>
                <li>Google, only if you choose to sign in with your Google account</li>
              </ul>
            </PolicySection>

            <PolicySection title="7. Data retention and deletion">
              <p>
                We keep your account and order history for as long as your account is active, since
                order and debt history is the record both buyers and sellers rely on. If you want your
                account deleted, email us at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-brand-gold-dark underline underline-offset-2">
                  {SUPPORT_EMAIL}
                </a>{" "}
                and we will handle your request.
              </p>
            </PolicySection>

            <PolicySection title="8. Children">
              <p>Nyakizu is a business tool for traders and is not intended for use by children.</p>
            </PolicySection>

            <PolicySection title="9. Changes to this policy">
              <p>
                If this policy changes, we will update the date at the top of this page. Significant
                changes will be communicated by email where practical.
              </p>
            </PolicySection>

            <PolicySection title="10. Contact us">
              <p>
                Questions about this policy or your data? Email{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-brand-gold-dark underline underline-offset-2">
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </PolicySection>
          </div>
        </Container>
      </Section>

      <LandingFooter />
    </div>
  );
}
