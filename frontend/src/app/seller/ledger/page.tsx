import { Container, Section } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import { Badge } from "@/components/ui/Badge";

export default function SellerLedger() {
  const transactions = [
    {
      date: "Today",
      buyer: "John Mwangi",
      type: "M-Pesa Payment",
      amount: "KES 3,200",
      status: "completed",
      reference: "TXN123456",
    },
    {
      date: "Yesterday",
      buyer: "Grace Kipchoge",
      type: "Order Created",
      amount: "KES 6,500",
      status: "pending",
      reference: "ORD2047",
    },
    {
      date: "2 days ago",
      buyer: "Moses Okonkwo",
      type: "M-Pesa Payment",
      amount: "KES 4,800",
      status: "completed",
      reference: "TXN123454",
    },
  ];

  return (
    <DashboardLayout title="Payment Ledger">
      <Section spacing="md">
        <Container size="xl" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Total Received", amount: "KES 14,500" },
              { label: "Pending", amount: "KES 6,500" },
              { label: "This Month", amount: "KES 450K" },
            ].map(({ label, amount }) => (
              <Card key={label}>
                <CardContent className="pt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {label}
                  </p>
                  <p className="text-2xl font-bold text-brand-gold">{amount}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>Complete payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map(({ date, buyer, type, amount, status, reference }) => (
                  <div
                    key={reference}
                    className="flex items-center justify-between py-4 border-b border-slate-800/50 last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-white">{buyer}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{type}</span>
                        <span>•</span>
                        <span>{reference}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold text-brand-gold text-lg">{amount}</p>
                      <Badge
                        variant={status === "completed" ? "success" : "warning"}
                        className="text-xs"
                      >
                        {status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </DashboardLayout>
  );
}