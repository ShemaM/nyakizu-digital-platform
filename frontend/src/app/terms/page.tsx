import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LandingHeader, LandingFooter, Container, Section } from "@/components/layouts";
import { SITE_URL } from "@/lib/seo";
import { SUPPORT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use Nyakizu Digital Market.",
  alternates: { canonical: `${SITE_URL}/terms` },
};

const LAST_UPDATED = "10 August 2026";

function TermsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-dark-accent py-8 first:pt-0 last:border-b-0 last:pb-0">
      <h2 className="text-xl font-bold text-text-primary mb-3">{title}</h2>
      <div className="space-y-3 text-text-secondary leading-relaxed">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-text-primary">
      <LandingHeader />

      <Section spacing="lg" className="pt-32 sm:pt-40">
        <Container size="sm">
          <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
              Terms of Service
            </h1>
            <p className="mt-3 text-text-secondary">Last updated {LAST_UPDATED}</p>
          </div>

          <div className="rounded-2xl border border-dark-accent bg-white px-6 sm:px-8">
            <TermsSection title="1. Agreement">
              <p>
                Nyakizu Digital Market is a free community platform for phone accessories wholesalers
                and resellers. By creating an account, you agree to these terms.
              </p>
            </TermsSection>

            <TermsSection title="2. Your account">
              <p>
                You must give accurate information when you sign up, and keep your password private.
                You are responsible for anything that happens under your account. Seller accounts are
                reviewed and approved by an administrator before they go live, to keep the platform
                trustworthy for everyone.
              </p>
            </TermsSection>

            <TermsSection title="3. Buyer approval">
              <p>
                A buyer must be approved by a specific seller before they can place orders with that
                seller. Sellers decide who they trade with. Nyakizu does not place buyers with
                sellers automatically.
              </p>
            </TermsSection>

            <TermsSection title="4. Orders">
              <p>
                Once a buyer submits an order, it locks and the buyer cannot edit it. This protects
                sellers from last-minute changes after they have started fulfilling it. A seller may
                adjust the final price after sourcing items, and sets the price the buyer is billed.
              </p>
            </TermsSection>

            <TermsSection title="5. Payments and debts">
              <p>
                Nyakizu does not process payments. Buyers and sellers arrange payment directly, for
                example by M-Pesa, and the seller records what they have received. The credit ledger
                on the platform is a shared record that helps both sides track what is owed. It does
                not make Nyakizu a party to that debt. Nyakizu is not responsible for collecting or
                guaranteeing any payment between users.
              </p>
            </TermsSection>

            <TermsSection title="6. Acceptable use">
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>List fake products or make false claims about stock or pricing</li>
                <li>Use the platform to defraud another user</li>
                <li>Attempt to access another user&apos;s account or data without permission</li>
                <li>Disrupt the platform or attempt to bypass its security</li>
              </ul>
              <p>
                We may suspend or remove an account that breaks these terms, with or without prior
                notice depending on the severity.
              </p>
            </TermsSection>

            <TermsSection title="7. The service is free">
              <p>
                There is no fee to use Nyakizu today, for buyers or sellers. If that ever changes, we
                will tell existing users in advance.
              </p>
            </TermsSection>

            <TermsSection title="8. No warranty">
              <p>
                Nyakizu is provided &quot;as is.&quot; We work to keep it reliable, including support for
                spotty internet connections, but we cannot guarantee it will always be available or
                error-free. We are not responsible for disputes between buyers and sellers over the
                quality of goods, delivery, or payment. Those stay between the two parties.
              </p>
            </TermsSection>

            <TermsSection title="9. Changes to these terms">
              <p>
                We may update these terms as the platform grows. We will update the date at the top of
                this page when we do.
              </p>
            </TermsSection>

            <TermsSection title="10. Contact us">
              <p>
                Questions about these terms? Email{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-brand-gold-dark underline underline-offset-2">
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </TermsSection>
          </div>
        </Container>
      </Section>

      <LandingFooter />
    </div>
  );
}
