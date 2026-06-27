import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, useClerk, UserButton } from "@clerk/react";
import { motion } from "framer-motion";
import {
  MapPin, Star, TrendingUp, MessageCircle, Plus, Clock,
  CheckCircle2, XCircle, LogOut, Flame, Heart, Bell, Zap,
  RefreshCw, PauseCircle, PlayCircle, Megaphone, Tag, Package, Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  paused: "bg-gray-100 text-gray-700 border-gray-200",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  paused: PauseCircle,
};

import type { BusinessRow } from "@/lib/api";

function SubscriptionTracker({ biz, onUpgrade }: { biz: BusinessRow; onUpgrade: (id: number) => void }) {
  const isPro = biz.business.subscriptionPlan === "pro";
  const trialOver = biz.trialExpired;
  const leadsUsed = biz.leadCount;
  const daysRemaining = biz.daysRemaining ?? 0;
  const daysUsed = Math.max(0, 90 - daysRemaining);

  if (isPro) {
    return (
      <Card className="border-2 border-primary/30 bg-primary/5 mb-4">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-primary">Pro Seller 🚀 - {biz.business.businessName}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Your subscription is active.</p>
          </div>
          <Badge className="bg-primary text-white">Active</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mb-4 border-2 ${trialOver ? "border-orange-300 bg-orange-50" : "border-primary/30 bg-primary/5"}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-base">
              {trialOver ? `Trial Complete — ${biz.business.businessName}` : `Founding Seller Offer 🎉 — ${biz.business.businessName}`}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {trialOver
                ? "Contact features are disabled. Upgrade to Pro - ₹199/month to reactivate."
                : "First 25 leads free OR 90 days free — whichever comes first."}
            </p>
          </div>
          <Button size="sm" onClick={() => onUpgrade(biz.business.id)} className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white">
            Upgrade to Pro — ₹199/month
          </Button>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>Leads Used</span>
              <span className={leadsUsed >= 25 ? "text-orange-600 font-bold" : ""}>{leadsUsed} / 25</span>
            </div>
            <Progress value={Math.min((leadsUsed / 25) * 100, 100)} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>Days Used</span>
              <span className={daysUsed >= 90 ? "text-orange-600 font-bold" : ""}>{daysUsed} / 90</span>
            </div>
            <Progress value={Math.min((daysUsed / 90) * 100, 100)} className="h-2" />
          </div>
        </div>
        {!trialOver && (
          <p className="text-xs text-muted-foreground mt-3 text-center font-medium">
            Trial Days Remaining: {daysRemaining}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function UpgradeModal({ isOpen, onClose, businessId }: { isOpen: boolean; onClose: () => void; businessId: number | null }) {
  const [utr, setUtr] = useState("");
  const qc = useQueryClient();
  const { toast } = useToast();

  const submitPayment = useMutation({
    mutationFn: () => api.payments.create({ businessId: businessId!, utrNumber: utr }),
    onSuccess: () => {
      toast({ title: "Payment submitted! Admins will review it shortly." });
      setUtr("");
      onClose();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Upgrade to Pro - ₹199/month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center space-y-2">
            <div className="w-48 h-48 bg-white flex items-center justify-center border-4 border-primary overflow-hidden">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi%3A%2F%2Fpay%3Fpa%3Dkotakupivk%40axl%26pn%3DHustly%26am%3D199%26cu%3DINR" alt="UPI QR Code" className="w-full h-full p-2 object-contain" />
            </div>
            <p className="text-sm font-medium">Scan to pay ₹199</p>
            <p className="text-xs text-muted-foreground">UPI ID: kotakupivk@axl</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Submit UTR Number</label>
            <Input placeholder="Enter 12-digit UTR number" value={utr} onChange={e => setUtr(e.target.value)} />
            <p className="text-xs text-muted-foreground">Please enter the UTR/Reference number from your UPI app after successful payment.</p>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => submitPayment.mutate()} disabled={!utr || submitPayment.isPending}>
              {submitPayment.isPending ? "Submitting..." : "Submit Payment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PostUpdateForm({ businesses }: { businesses: { business: { id: number; businessName: string } }[] }) {
  const [open, setOpen] = useState(false);
  const [bizId, setBizId] = useState<number | null>(businesses[0]?.business?.id ?? null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const qc = useQueryClient();
  const { toast } = useToast();

  const post = useMutation({
    mutationFn: () => api.feed.create({ businessId: bizId!, title, body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      setTitle(""); setBody(""); setOpen(false);
      toast({ title: "Update posted! Your neighbours can see it now." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-primary/40 hover:border-primary/70 hover:bg-primary/5 transition-all text-left group"
      >
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Megaphone className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm">Post an update today to get more visibility</p>
          <p className="text-xs text-muted-foreground">Share your menu, offers or announcements</p>
        </div>
      </button>
    );
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-5">
        <h4 className="font-bold mb-3">Post an Update</h4>
        <div className="space-y-3">
          {businesses.length > 1 && (
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={bizId ?? ""}
              onChange={e => setBizId(Number(e.target.value))}
            >
              {businesses.map(r => (
                <option key={r.business.id} value={r.business.id}>{r.business.businessName}</option>
              ))}
            </select>
          )}
          <Input placeholder="Title (e.g. Today's Special Menu)" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="What's new? Share your offer, menu, or announcement…" rows={3} className="resize-none" value={body} onChange={e => setBody(e.target.value)} />
          <div className="flex gap-3">
            <Button size="sm" disabled={!title || !body || !bizId || post.isPending} onClick={() => post.mutate()}>
              {post.isPending ? "Posting…" : "Post Update"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateDealForm({ businesses }: { businesses: { business: { id: number; businessName: string } }[] }) {
  const [open, setOpen] = useState(false);
  const [bizId, setBizId] = useState<number | null>(businesses[0]?.business?.id ?? null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const qc = useQueryClient();
  const { toast } = useToast();

  const create = useMutation({
    mutationFn: () => api.deals.create({ businessId: bizId!, title, description, expiresAt: new Date(expiresAt).toISOString() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deals"] });
      setTitle(""); setDescription(""); setExpiresAt(""); setOpen(false);
      toast({ title: "Deal created! It'll appear on the home page." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().slice(0, 16);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50 transition-all text-left group"
      >
        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
          <Tag className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <p className="font-semibold text-sm">Create a Daily Deal</p>
          <p className="text-xs text-muted-foreground">Limited-time offer with countdown timer</p>
        </div>
      </button>
    );
  }

  return (
    <Card className="border-orange-300 bg-orange-50">
      <CardContent className="p-5">
        <h4 className="font-bold mb-3 text-orange-800">Create a Daily Deal</h4>
        <div className="space-y-3">
          {businesses.length > 1 && (
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={bizId ?? ""}
              onChange={e => setBizId(Number(e.target.value))}
            >
              {businesses.map(r => (
                <option key={r.business.id} value={r.business.id}>{r.business.businessName}</option>
              ))}
            </select>
          )}
          <Input placeholder="Deal title (e.g. Buy 5 get 1 free)" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Describe the offer…" rows={2} className="resize-none bg-white" value={description} onChange={e => setDescription(e.target.value)} />
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Expires at</label>
            <Input type="datetime-local" min={minDateStr} value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="bg-white" />
          </div>
          <div className="flex gap-3">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" disabled={!title || !description || !expiresAt || !bizId || create.isPending} onClick={() => create.mutate()}>
              {create.isPending ? "Creating…" : "Create Deal"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SellerDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [upgradeBizId, setUpgradeBizId] = useState<number | null>(null);

  const { data: businesses, isLoading: bizLoading } = useQuery({
    queryKey: ["my-businesses"],
    queryFn: () => api.businesses.mine(),
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["seller-analytics"],
    queryFn: () => api.analytics.seller(),
  });

  const pauseMutation = useMutation({
    mutationFn: (id: number) => api.businesses.pause(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-businesses"] }); toast({ title: "Listing paused" }); },
  });

  const unpauseMutation = useMutation({
    mutationFn: (id: number) => api.businesses.unpause(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-businesses"] }); toast({ title: "Listing reactivated and sent for review" }); },
  });

  const approvedBusinesses = businesses?.filter(r => r.business.status === "approved") ?? [];

  const statCards = [
    { label: "Leads This Month", value: analyticsLoading ? "…" : analytics?.leadsThisMonth ?? 0, icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Leads", value: analyticsLoading ? "…" : analytics?.totalLeads ?? 0, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Repeat Customers", value: analyticsLoading ? "…" : analytics?.repeatLeads ?? 0, icon: RefreshCw, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Avg. Rating", value: analyticsLoading ? "…" : `${Number(analytics?.avgRating ?? 0).toFixed(1)} ⭐`, icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Navbar */}
      <Navbar
        rightContent={
          <>
            <Button variant="outline" size="sm" onClick={() => setLocation("/sell")}>
              <Plus className="w-4 h-4 mr-1" />New Listing
            </Button>
            <div className="flex items-center gap-2 border-l border-border/40 pl-2 ml-1">
              <Button variant="outline" size="sm" onClick={() => signOut({ redirectUrl: basePath || "/" })}>
                <LogOut className="w-4 h-4 mr-1" />Sign Out
              </Button>
              <div className="h-8 w-8 flex items-center justify-center">
                <UserButton />
              </div>
            </div>
          </>
        }
        mobileContent={
          <>
            <Button variant="outline" size="sm" className="justify-start w-full" onClick={() => setLocation("/sell")}>
              <Plus className="w-4 h-4 mr-1" />New Listing
            </Button>
            <Button variant="outline" size="sm" className="justify-start w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => signOut({ redirectUrl: basePath || "/" })}>
              <LogOut className="w-4 h-4 mr-1" />Sign Out
            </Button>
          </>
        }
      />

      <main className="container mx-auto px-4 md:px-6 py-10 max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-1">
            Your Dashboard, {user?.firstName ?? "Seller"} 👋
          </h1>
          <p className="text-muted-foreground">Manage your hustles and track your growth</p>
        </div>

        {/* Lead reminder */}
        {!analyticsLoading && analytics && analytics.leadsThisMonth > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <Bell className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm font-medium">
                You received <strong>{analytics.leadsThisMonth} leads</strong> from Hustly this month. Keep the momentum going!
              </p>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Subscription tracker */}
        <div className="mb-8">
          {approvedBusinesses.map((biz) => (
            <SubscriptionTracker
              key={`sub-${biz.business.id}`}
              biz={biz}
              onUpgrade={setUpgradeBizId}
            />
          ))}
        </div>

        {/* Engagement tools */}
        {approvedBusinesses.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-base font-bold text-foreground">Engage Your Community</h2>
            <PostUpdateForm businesses={approvedBusinesses} />
            <CreateDealForm businesses={approvedBusinesses} />
          </div>
        )}

        {/* My listings */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">My Listings</h2>
            <Button size="sm" onClick={() => setLocation("/sell")}>
              <Plus className="w-4 h-4 mr-1" />Add Listing
            </Button>
          </div>

          {bizLoading && (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
            </div>
          )}

          {!bizLoading && !businesses?.length && (
            <Card className="border-dashed border-2 border-border/60">
              <CardContent className="p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">List your first hustle</h3>
                <p className="text-sm text-muted-foreground mb-6">Reach hundreds of neighbours in your society.</p>
                <Button onClick={() => setLocation("/sell")}>Start Your Hustle</Button>
              </CardContent>
            </Card>
          )}

          {!bizLoading && businesses?.map((row, idx) => {
            const biz = row.business;
            const StatusIcon = STATUS_ICONS[biz.status] ?? Clock;
            return (
              <motion.div key={biz.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }} className="mb-4">
                <Card className="border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold truncate">{biz.businessName}</h3>
                          <Badge className={`text-xs border ${STATUS_COLORS[biz.status]}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {biz.status.charAt(0).toUpperCase() + biz.status.slice(1)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">{biz.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{biz.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3 text-primary" />{row.leadCount} leads
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />{Number(row.avgRating).toFixed(1)} ({row.reviewCount})
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-400" />{row.society?.name ?? "—"}
                          </span>
                        </div>
                        {biz.status === "pending" && (
                          <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 mt-2 inline-block">
                            Under review — will be live within 24 hours
                          </p>
                        )}
                        {biz.status === "rejected" && (
                          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 mt-2 inline-block">
                            Listing rejected — contact support if you think this is wrong
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0 flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => setLocation(`/sell/edit/${biz.id}`)}>
                          <Pencil className="w-4 h-4 mr-1" />Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setLocation(`/dashboard/products/${biz.id}`)}>
                          <Package className="w-4 h-4 mr-1" />Products
                        </Button>
                        {biz.status === "approved" && (
                          <Button size="sm" variant="outline" onClick={() => pauseMutation.mutate(biz.id)} disabled={pauseMutation.isPending}>
                            <PauseCircle className="w-4 h-4 mr-1" />Pause
                          </Button>
                        )}
                        {biz.status === "paused" && (
                          <Button size="sm" variant="outline" onClick={() => unpauseMutation.mutate(biz.id)} disabled={unpauseMutation.isPending}>
                            <PlayCircle className="w-4 h-4 mr-1" />Reactivate
                          </Button>
                        )}
                        {biz.status === "approved" && (
                          <Button size="sm" variant="outline" onClick={() => setLocation(`/business/${biz.id}`)}>
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>

      <UpgradeModal 
        isOpen={upgradeBizId !== null} 
        onClose={() => setUpgradeBizId(null)} 
        businessId={upgradeBizId} 
      />
    </div>
  );
}
