import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, CheckCircle2, XCircle, Clock, TrendingUp, Building2, Users, LogOut, ShieldCheck, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  paused: "bg-gray-100 text-gray-700",
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || "/api"}/admin/logout`, { method: "POST", credentials: "include" });
    } catch (err) {}
    localStorage.removeItem("admin_token"); // for backwards compatibility
    setLocation("/admin-login");
  };

  const [activeTab, setActiveTab] = useState("pending");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.admin.stats(),
  });

  const { data: businesses, isLoading: bizLoading } = useQuery({
    queryKey: ["admin-businesses", activeTab],
    queryFn: () => api.admin.businesses(activeTab),
    enabled: activeTab !== "payments",
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.admin.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-businesses"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Status updated" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => api.admin.payments(),
    enabled: activeTab === "payments",
  });

  const approvePayment = useMutation({
    mutationFn: (id: number) => api.admin.updatePayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      toast({ title: "Payment approved" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const statCards = [
    { label: "Total Hustles", value: stats?.totalBusinesses ?? "—", icon: Building2 },
    { label: "Pending Review", value: stats?.pendingBusinesses ?? "—", icon: Clock },
    { label: "Active Sellers", value: stats?.approvedBusinesses ?? "—", icon: Users },
    { label: "Total Leads", value: stats?.totalLeads ?? "—", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar
        rightContent={
          <>
            <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />Admin
            </Badge>
            <div className="flex items-center gap-2 border-l border-border/40 pl-2 ml-1">
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />Sign Out
              </Button>
            </div>
          </>
        }
        mobileContent={
          <>
            <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold justify-center py-1 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />Admin Session
            </Badge>
            <Button variant="outline" size="sm" className="justify-start w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />Sign Out
            </Button>
          </>
        }
      />

      <main className="container mx-auto px-4 md:px-6 py-10 max-w-6xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage hustles, sellers, and the Hustly community</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {statCards.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{statsLoading ? "…" : stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {stats?.topCategories && stats.topCategories.length > 0 && (
          <Card className="mb-10 border-border/50">
            <CardHeader><CardTitle className="text-base font-semibold">Top Categories</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {stats.topCategories.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                    <span className="text-sm font-semibold">{cat.category}</span>
                    <Badge variant="secondary" className="text-xs">{cat.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <h2 className="text-xl font-bold mb-5">Hustle Approvals</h2>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            {paymentsLoading && <div className="grid gap-4">{[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>}
            {!paymentsLoading && (!payments || payments.length === 0) && (
              <div className="text-center py-16 text-muted-foreground">No pending payments.</div>
            )}
            {!paymentsLoading && payments?.map((row: any) => {
              const { payment, business } = row;
              return (
                <Card key={payment.id} className="mb-4 border-border/50">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{business?.businessName ?? "Unknown Business"}</h3>
                      <h4 className="font-semibold text-primary">Amount: ₹{payment.amount}</h4>
                      <p className="text-sm text-muted-foreground mt-1">UTR: <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{payment.utrNumber}</span></p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted: {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {payment.status === "pending" ? (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={approvePayment.isPending}
                        onClick={() => approvePayment.mutate(payment.id)}
                      >
                        <IndianRupee className="w-4 h-4 mr-1" /> Approve Payment
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Approved
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {["pending", "approved", "rejected"].map(tab => (
            <TabsContent key={tab} value={tab}>
              {bizLoading && <div className="grid gap-4">{[1,2,3].map(i => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>}
              {!bizLoading && !businesses?.length && (
                <div className="text-center py-16 text-muted-foreground">No {tab} businesses at the moment.</div>
              )}
              {!bizLoading && businesses?.map((row, idx) => {
                const biz = row.business;
                return (
                  <motion.div key={biz.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="mb-4">
                    <Card className="border-border/50">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold">{biz.businessName}</h3>
                              <Badge className={`text-xs ${STATUS_COLORS[biz.status]}`}>{biz.status}</Badge>
                              <Badge variant="secondary" className="text-xs">{biz.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{biz.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                              <span>Owner: <strong>{biz.ownerName}</strong></span>
                              <span>Area: <strong>{row.society?.name ?? "—"}</strong></span>
                              <span>Phone: {biz.phone}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {biz.status !== "approved" && (
                              <Button size="sm" className="bg-primary hover:bg-primary/90" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: biz.id, status: "approved" })}>
                                <CheckCircle2 className="w-4 h-4 mr-1" />Approve
                              </Button>
                            )}
                            {biz.status !== "rejected" && (
                              <Button size="sm" variant="destructive" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: biz.id, status: "rejected" })}>
                                <XCircle className="w-4 h-4 mr-1" />Reject
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
