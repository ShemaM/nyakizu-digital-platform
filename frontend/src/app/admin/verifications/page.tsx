import { Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import { Badge } from "@/components/ui/Badge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export default function AdminVerifications() {
  const verifications = [
    {
      id: 1,
      seller: "TechPlus Store",
      owner: "Ali Hassan",
      location: "RNG Plaza - Stall 72",
      status: "pending",
      submitted: "2 days ago",
      documents: 3,
    },
    {
      id: 2,
      seller: "Mobile World",
      owner: "Sarah Okonkwo",
      location: "Westlands",
      status: "pending",
      submitted: "1 day ago",
      documents: 2,
    },
  ];

  return (
    <DashboardLayout title="Seller Verifications">
      <Section spacing="md">
        <Container size="xl" className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Pending Verifications</h2>

          <div className="space-y-4">
            {verifications.map((verification) => (
              <Card key={verification.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-bold text-white">{verification.seller}</h3>
                          <p className="text-sm text-slate-400">
                            {verification.owner} • {verification.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <AlertCircle className="w-3 h-3" />
                        <span>Submitted {verification.submitted}</span>
                        <span>•</span>
                        <span>{verification.documents} documents</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2 text-error">
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
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