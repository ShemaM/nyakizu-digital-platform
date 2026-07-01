import { Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import { Mail, Phone, MapPin, LogOut } from "lucide-react";

export default function BuyerAccount() {
  const user = {
    name: "John Mwangi",
    email: "john@example.com",
    phone: "+254 700 123 456",
    location: "RNG Plaza, Nairobi",
    businessType: "Phone Reseller",
    joined: "January 2024",
  };

  return (
    <DashboardLayout title="Account Settings">
      <Section spacing="md">
        <Container size="md" className="space-y-8">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-label">Full Name</label>
                  <p className="text-white font-semibold mt-1">{user.name}</p>
                </div>
                <div>
                  <label className="text-label">Business Type</label>
                  <p className="text-white font-semibold mt-1">{user.businessType}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-gold" />
                  <div>
                    <label className="text-label">Email</label>
                    <p className="text-white text-sm mt-1">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-gold" />
                  <div>
                    <label className="text-label">Phone</label>
                    <p className="text-white text-sm mt-1">{user.phone}</p>
                  </div>
                </div>
              </div>
              <Button variant="secondary" size="sm">
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span className="text-white">Email notifications for new suppliers</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span className="text-white">SMS alerts for debt reminders</span>
              </label>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card variant="outlined" className="border-error/20">
            <CardHeader>
              <CardTitle className="text-error">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Sign Out</p>
                  <p className="text-sm text-slate-400">End your current session</p>
                </div>
                <Button variant="danger" size="sm" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </DashboardLayout>
  );
}