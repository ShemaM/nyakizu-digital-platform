import { Container, Section } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import { Badge } from "@/components/ui/Badge";
import { AlertCircle } from "lucide-react";

export default function BuyerDebts() {
  const debts = [
    {
      supplier: "Kamau Electronics",
      amount: "KES 8,500",
      dueDate: "2024-02-15",
      status: "pending",
      items: 12,
    },
    {
      supplier: "Tech Hub",
      amount: "KES 3,200",
      dueDate: "2024-02-10",
      status: "overdue",
      items: 5,
    },
  ];

  const totalDebt = debts.reduce((sum, d) => sum + parseInt(d.amount.replace(/[^0-9]/g, "")), 0);

  return (
    <DashboardLayout title="Debts">
      <Section spacing="md">
        <Container size="xl" className="space-y-6">
          {/* Total Debt Summary */}
          <Card variant="elevated" className="border-warning/20 bg-warning/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-warning" />
                <CardTitle>Total Outstanding</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-warning">KES {(totalDebt / 1000).toFixed(0)}K</p>
              <p className="text-sm text-slate-400 mt-2">
                Across {debts.length} supplier{debts.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          {/* Debt List */}
          <div className="space-y-4">
            {debts.map((debt) => (
              <Card key={debt.supplier}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="font-bold text-white">{debt.supplier}</h3>
                      <p className="text-sm text-slate-400">
                        {debt.items} items • Due {debt.dueDate}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold text-error text-lg">{debt.amount}</p>
                      <Badge
                        variant={debt.status === "overdue" ? "error" : "warning"}
                        className="text-xs"
                      >
                        {debt.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </DashboardLayout>
  );
}