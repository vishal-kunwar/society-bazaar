import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useClerk } from "@clerk/react";
import { motion } from "framer-motion";
import { MapPin, CheckCircle2, XCircle, Clock, TrendingUp, Building2, Users, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  paused: "bg-gray-100 text-gray-700",
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { signOut } = useClerk();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.admin.stats(),
  });

  const { data: businesses, isLoading: bizLoading } = useQuery({
    queryKey: ["admin-businesses", activeTab],
    queryFn: () => api.admin.businesses(activeTab),
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

  const statCards = [
    { label: "Total Hustles", value: stats?.totalBusinesses ?? "—", icon: Building2 },
    { label: "Pending Review", value: stats?.pendingBusinesses ?? "—", icon: Clock },
    { label: "Active Sellers", value: stats?.approvedBusinesses ?? "—", icon: Users },
    { label: "Total Leads", value: stats?.totalLeads ?? "—", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Hust<span className="text-primary">ly</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />Admin
            </Badge>
            <Button variant="outline" size="sm" onClick={() => signOut({ redirectUrl: basePath || "/" })}>
              <LogOut className="w-4 h-4 mr-2" />Sign Out
            </Button>
          </div>
        </div>
      </nav>

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
          </TabsList>

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
