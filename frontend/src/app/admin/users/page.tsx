"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { admin, type User, ApiError } from "@/lib/api";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Users, RefreshCw, Search, Mail, Phone, Shield } from "lucide-react";

export default function AdminUsersPage() {
  const [userList, setUserList] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await admin.userList(roleFilter || undefined);
      setUserList(data);
      setFiltered(data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err instanceof ApiError ? err.message : "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const s = search.toLowerCase();
    setFiltered(
      userList.filter(
        (u) =>
          u.username.toLowerCase().includes(s) ||
          u.full_name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          u.phone_number.includes(s)
      )
    );
  }, [search, userList]);

  if (isLoading) {
    return (
      <DashboardLayout title="Users">
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingScreen />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Users">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-error text-sm">{error}</p>
          <Button onClick={loadUsers} size="sm">Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    total: userList.length,
    buyers: userList.filter((u) => u.role === "buyer").length,
    sellers: userList.filter((u) => u.role === "seller").length,
    admins: userList.filter((u) => u.role === "admin").length,
    verified: userList.filter((u) => u.is_email_verified).length,
  };

  return (
    <DashboardLayout title="Users">
      <div className="space-y-6 p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total", value: stats.total, icon: Users },
            { label: "Buyers", value: stats.buyers, icon: Users },
            { label: "Sellers", value: stats.sellers, icon: Users },
            { label: "Admins", value: stats.admins, icon: Shield },
            { label: "Verified", value: stats.verified, icon: Mail },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="pt-6 text-center">
                <Icon className="w-5 h-5 text-brand-gold mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search users..."
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            {["", "buyer", "seller", "admin"].map((role) => (
              <button
                key={role || "all"}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                  roleFilter === role
                    ? "bg-brand-gold text-dark-primary"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {role || "All"}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={loadUsers}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
        </div>

        {/* Users table */}
        <div className="space-y-3">
          {filtered.map((user) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{user.full_name || user.username}</span>
                      <Badge
                        variant={
                          user.role === "admin"
                            ? "error"
                            : user.role === "seller"
                            ? "warning"
                            : "success"
                        }
                        className="text-xs"
                      >
                        {user.role}
                      </Badge>
                      {user.is_email_verified && (
                        <Badge variant="success" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail size={11} /> {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={11} /> {user.phone_number}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    Joined {new Date(user.date_joined).toLocaleDateString("en-KE")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm">No users found.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
