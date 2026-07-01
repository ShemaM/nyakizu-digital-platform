import { Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import { Badge } from "@/components/ui/Badge";
import { Mail, Phone, MapPin, LogOut, Store } from "lucide-react";

export default function SellerAccount() {
  const user = {
    shopName: "Kamau Electronics",
    owner: "Joseph Kamau",
    email: "kamau@example.com",
    phone: "+254 700 987 654",
    location: "RNG Plaza - Stall 42",
    joined: "March 2023",
    verified: true,
  };

  return (
    <DashboardLayout title="Account Settings">
      <Section spacing="md">
        <Container size="md" className="space-y-8">
          {/* Shop Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Shop Profile</CardTitle>
                  <CardDescription>Your business information</CardDescription>
                </div>
                {user.verified && <Badge variant="success">Verified Seller</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-label">Shop Name</label>
                  <p className="text-white font-semibold mt-1">{user.shopName}</p>
                </div>
                <div>
                  <label className="text-label">Owner Name</label>
                  <p className="text-white font-semibold mt-1">{user.owner}</p>
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
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="w-4 h-4 text-brand-gold" />
                  <div>
                    <label className="text-label">Location</label>
                    <p className="text-white text-sm mt-1">{user.location}</p>
                  </div>
                </div>
              </div>
              <Button variant="secondary" size="sm">
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure how you receive payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                  <div>
                    <p className="font-semibold text-white">M-Pesa Paybill</p>
                    <p className="text-sm text-slate-400">Primary payment method</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
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
                <span className="text-white">Email notifications for new orders</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span className="text-white">SMS alerts for payments</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-white">Weekly sales report</span>
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