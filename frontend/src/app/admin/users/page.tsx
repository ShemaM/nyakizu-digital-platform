import { Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, XCircle, Search } from "lucide-react";

export default function AdminUsers() {
  const users = [
    {
      id: 1,
      name: "John Mwangi",
      email: "john@example.com",
      role: "buyer",
      joined: "Jan 15, 2024",
      status: "active",
    },
    {
      id: 2,
      name: "Kamau Electronics",
      email: "kamau@example.com",
      role: "seller",
      joined: "Mar 8, 2023",
      status: "verified",
    },
  ];

  return (
    <DashboardLayout title="User Management">
      <Section spacing="md">
        <Container size="xl" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Users</h2>
          </div>

          <Input placeholder="Search users..." icon={<Search className="w-4 h-4" />} />

          <div className="space-y-3">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-white">{user.name}</h3>
                        <Badge variant={user.role === "buyer" ? "info" : "primary"}>
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400">{user.email} • Joined {user.joined}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        View
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