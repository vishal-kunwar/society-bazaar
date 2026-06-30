import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, useClerk, UserButton } from "@clerk/react";
import { motion } from "framer-motion";
import {
  MapPin, Star, TrendingUp, MessageCircle, Plus, Clock,
  CheckCircle2, XCircle, LogOut, Flame, Heart, Bell, Zap,
  RefreshCw, PauseCircle, PlayCircle, Megaphone, Tag, Package, Pencil, X,
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

  const remainingLeads = Math.max(0, 25 - leadsUsed);

  // Determine if free plan has ended
  const freePlanEnded = trialOver || leadsUsed >= 25 || daysRemaining <= 0;

  // Determine if low leads warning should be shown (5 or fewer leads remaining, but free plan has not fully ended)
  const showLowLeadsWarning = !isPro && !freePlanEnded && remainingLeads <= 5 && remainingLeads > 0;

  if (isPro) {
    return (
      <div className="space-y-4 mb-6">
        <Card className="border-2 border-green-500/30 bg-green-500/5 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <span className="text-green-600 text-lg">⭐</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                    PRO PLAN ACTIVE <span className="text-sm font-normal text-muted-foreground">({biz.business.businessName})</span>
                  </h3>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Unlimited Leads · Unlimited Daily Deals</p>
                </div>
              </div>
              <Badge className="bg-green-600 text-white hover:bg-green-700">Active</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/40 pt-4">
              <div className="space-y-2">
                <p className="text-sm text-foreground">
                  <strong>Plan Status:</strong> <span className="text-green-600 font-semibold">Active</span>
                </p>
                {biz.business.proValidUntil && (
                  <p className="text-sm text-foreground">
                    <strong>Valid Until:</strong> {new Date(biz.business.proValidUntil).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-foreground">
                  <strong>Monthly Leads Received:</strong> <span className="font-semibold text-primary">{leadsUsed}</span>
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Unlimited Leads & Deals Enabled <span className="text-base">♾️</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onUpgrade(biz.business.id)}
                className="text-primary hover:text-primary-hover border-primary/20 hover:bg-primary/5"
              >
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Free Plan Ended Banner */}
      {freePlanEnded && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="font-bold text-red-800 text-sm flex items-center gap-1.5">
              Free Plan Ended
            </h4>
            <p className="text-xs text-red-700 mt-1">
              Your FREE plan has ended. Buyers can still discover your business, but your WhatsApp contact button is disabled until you activate Pro.
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={() => onUpgrade(biz.business.id)} 
            className="bg-red-600 hover:bg-red-700 text-white shrink-0 font-medium"
          >
            Activate Pro — ₹199/month
          </Button>
        </div>
      )}

      {/* Low Free Leads Warning Banner */}
      {showLowLeadsWarning && (
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="font-bold text-orange-800 text-sm flex items-center gap-1.5">
              🎉 Great news! Your business is getting noticed.
            </h4>
            <p className="text-xs text-orange-700 mt-1">
              Only {remainingLeads} FREE leads remaining. Upgrade now to continue receiving unlimited customer enquiries.
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={() => onUpgrade(biz.business.id)} 
            className="bg-orange-500 hover:bg-orange-600 text-white shrink-0 font-medium"
          >
            Upgrade Now
          </Button>
        </div>
      )}

      {/* Free Plan Card */}
      <Card className={`border-2 ${freePlanEnded ? "border-red-200 bg-red-50/10" : "border-primary/20 bg-primary/5"} shadow-sm`}>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Free Plan Details & Stats */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-foreground flex items-center gap-1.5">
                  🎉 Founding Seller Plan
                </h3>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  25 Free Leads + 90-Day Trial
                </p>
                <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                  Business: {biz.business.businessName}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Free Leads</span>
                    <span className={leadsUsed >= 25 ? "text-red-600 font-bold" : ""}>
                      {leadsUsed} / 25 used
                    </span>
                  </div>
                  <Progress value={Math.min((leadsUsed / 25) * 100, 100)} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Free Trial</span>
                    <span className={daysRemaining <= 0 ? "text-red-600 font-bold" : ""}>
                      {daysUsed} / 90 days used
                    </span>
                  </div>
                  <Progress value={Math.min((daysUsed / 90) * 100, 100)} className="h-2" />
                </div>
              </div>

              <ul className="text-xs space-y-1.5 text-muted-foreground border-t border-border/40 pt-3">
                <li className="flex items-center justify-between">
                  <span>• Free Leads Used:</span>
                  <span className="font-medium text-foreground">{leadsUsed} / 25</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>• Remaining Free Leads:</span>
                  <span className="font-medium text-foreground">{remainingLeads}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>• Free Trial Days Used:</span>
                  <span className="font-medium text-foreground">{daysUsed} / 90</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>• Trial Days Remaining:</span>
                  <span className="font-medium text-foreground">{daysRemaining}</span>
                </li>
              </ul>
            </div>

            {/* Right Column: Pro Plan Value Section */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-base text-foreground flex items-center gap-1.5">
                  ⭐ Upgrade to Pro — ₹199/month
                </h4>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  Keep receiving customer enquiries without interruption.
                </p>
                <ul className="text-xs space-y-2 text-foreground/90">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 shrink-0">✅</span>
                    <span>Unlimited WhatsApp Leads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 shrink-0">✅</span>
                    <span>Unlimited Daily Deals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 shrink-0">✅</span>
                    <span>Priority Listing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 shrink-0">✅</span>
                    <span>PRO Seller Badge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 shrink-0">✅</span>
                    <span>Future Premium Features</span>
                  </li>
                </ul>
              </div>
              <Button 
                onClick={() => onUpgrade(biz.business.id)} 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm mt-2"
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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
          {/* Pro Benefits */}
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-1.5">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">⭐ Pro Benefits Include:</p>
            <ul className="text-xs space-y-1 text-foreground/90">
              <li>✅ <strong>Unlimited WhatsApp Leads</strong></li>
              <li>✅ <strong>Unlimited Daily Deals</strong></li>
              <li>✅ <strong>Priority Listing</strong></li>
              <li>✅ <strong>PRO Seller Badge</strong></li>
              <li>✅ <strong>Future Premium Features</strong></li>
            </ul>
          </div>

          <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center space-y-2">
            <div className="w-48 h-48 bg-white flex items-center justify-center border-4 border-primary overflow-hidden">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi%3A%2F%2Fpay%3Fpa%3Dkotakupivk%40axl%26pn%3DGoHustly%26am%3D199%26cu%3DINR" alt="UPI QR Code" className="w-full h-full p-2 object-contain" />
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

// Returns a datetime-local string in local time (not UTC) for use in input min attributes
function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getDealStatus(deal: { startsAt: string; expiresAt: string }): "scheduled" | "active" | "expired" {
  const now = Date.now();
  if (now < new Date(deal.startsAt).getTime()) return "scheduled";
  if (now < new Date(deal.expiresAt).getTime()) return "active";
  return "expired";
}

function DealCountdownSeller({ expiresAt }: { expiresAt: string }) {
  const [time, setTime] = useState(() => {
    const total = new Date(expiresAt).getTime() - Date.now();
    if (total <= 0) return null;
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((total % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  });
  useEffect(() => {
    const t = setInterval(() => {
      const total = new Date(expiresAt).getTime() - Date.now();
      if (total <= 0) { setTime(null); return; }
      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((total % (1000 * 60)) / 1000);
      setTime({ days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  if (!time) return <span className="font-bold text-red-500">Expired</span>;
  if (time.days > 0) return <span className="font-bold text-orange-700">{time.days}d {time.hours}h left</span>;
  return <span className="font-bold text-red-600 tabular-nums">{String(time.hours).padStart(2, "0")}:{String(time.minutes).padStart(2, "0")}:{String(time.seconds).padStart(2, "0")} left</span>;
}

function CreateDealForm({ 
  businesses, 
  onUpgrade 
}: { 
  businesses: BusinessRow[]; 
  onUpgrade: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [selectedBizId, setSelectedBizId] = useState<number | null>(businesses[0]?.business?.id ?? null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [startsAt, setStartsAt] = useState(() => toLocalDatetimeString(new Date()));
  const [expiresAt, setExpiresAt] = useState("");
  const [validationError, setValidationError] = useState("");
  
  const qc = useQueryClient();
  const { toast } = useToast();

  const selectedBizRow = businesses.find(r => r.business.id === selectedBizId);
  // Seller sees any non-expired deal (scheduled + active)
  const currentDeal = selectedBizRow?.activeDeal && new Date(selectedBizRow.activeDeal.expiresAt) > new Date() 
    ? selectedBizRow.activeDeal 
    : null;

  const isPro = selectedBizRow?.business.subscriptionPlan === "pro";
  const trialExpired = selectedBizRow?.trialExpired ?? false;

  const nowStr = toLocalDatetimeString(new Date());

  const create = useMutation({
    mutationFn: () => {
      const startD = new Date(startsAt);
      const expD = new Date(expiresAt);
      const now = new Date(Date.now() - 60000); // 1 minute buffer for latency
      if (startD < now || expD < now) throw new Error("Please select a future time.");
      if (expD <= startD) throw new Error("Expiry time must be after start time.");
      return api.deals.create({ 
        businessId: selectedBizId!, 
        title, 
        description, 
        offerPrice: offerPrice || undefined, 
        startsAt: startD.toISOString(),
        expiresAt: expD.toISOString(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-businesses"] });
      qc.invalidateQueries({ queryKey: ["deals"] });
      setTitle(""); setDescription(""); setOfferPrice(""); setExpiresAt(""); setValidationError(""); setOpen(false);
      toast({ title: "Deal created! It'll appear on the home page once it starts." });
    },
    onError: (e: Error) => {
      setValidationError(e.message);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const update = useMutation({
    mutationFn: () => {
      const startD = new Date(startsAt);
      const expD = new Date(expiresAt);
      const now = new Date(Date.now() - 60000); // 1 minute buffer for latency
      if (startD < now || expD < now) throw new Error("Please select a future time.");
      if (expD <= startD) throw new Error("Expiry time must be after start time.");
      return api.deals.update(currentDeal!.id, {
        title,
        description,
        offerPrice: offerPrice || undefined,
        startsAt: startD.toISOString(),
        expiresAt: expD.toISOString(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-businesses"] });
      qc.invalidateQueries({ queryKey: ["deals"] });
      setEditMode(false); setValidationError("");
      toast({ title: "Deal updated successfully." });
    },
    onError: (e: Error) => {
      setValidationError(e.message);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const endDeal = useMutation({
    mutationFn: () => api.deals.end(currentDeal!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-businesses"] });
      qc.invalidateQueries({ queryKey: ["deals"] });
      setConfirmEnd(false);
      toast({ title: "Deal ended. Buyers will no longer see this deal." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openEditMode = () => {
    if (!currentDeal) return;
    setTitle(currentDeal.title);
    setDescription(currentDeal.description);
    setOfferPrice(currentDeal.offerPrice ?? "");
    setStartsAt(toLocalDatetimeString(new Date(currentDeal.startsAt)));
    setExpiresAt(toLocalDatetimeString(new Date(currentDeal.expiresAt)));
    setValidationError("");
    setEditMode(true);
  };

  const handleExpiryChange = (val: string) => {
    setExpiresAt(val);
    if (!val) {
      setValidationError("");
      return;
    }
    const expD = new Date(val);
    const startD = startsAt ? new Date(startsAt) : null;
    const now = new Date(Date.now() - 60000); // 1 minute buffer for latency

    if (expD <= now) {
      setValidationError("Please select a future time.");
    } else if (startD && expD <= startD) {
      setValidationError("Expiry time must be after start time.");
    } else {
      setValidationError("");
    }
  };

  const handleStartChange = (val: string) => {
    setStartsAt(val);
    if (!val) {
      setValidationError("");
      return;
    }
    const startD = new Date(val);
    const expD = expiresAt ? new Date(expiresAt) : null;
    const now = new Date(Date.now() - 60000); // 1 minute buffer for latency

    if (startD <= now) {
      setValidationError("Please select a future time.");
    } else if (expD && expD <= startD) {
      setValidationError("Expiry time must be after start time.");
    } else {
      setValidationError("");
    }
  };

  // If trial has expired and not Pro, show the locked state
  if (trialExpired && !isPro) {
    return (
      <Card className="border-red-200 bg-red-50/10 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <span className="text-red-600 text-lg">🔒</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">
                Daily Deals are available only for Pro Sellers
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upgrade to Pro to create unlimited limited-time offers and continue getting customer enquiries.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => onUpgrade(selectedBizId!)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            Upgrade to Pro — ₹199/month
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If there is a current deal (scheduled or active), show it with status + analytics + actions
  if (currentDeal && !editMode) {
    const status = getDealStatus(currentDeal);
    const statusConfig = {
      scheduled: { label: "⏰ Scheduled", classes: "bg-blue-100 text-blue-800 border-blue-200" },
      active:    { label: "🔥 Active",    classes: "bg-orange-100 text-orange-800 border-orange-200" },
      expired:   { label: "✓ Expired",   classes: "bg-gray-100 text-gray-600 border-gray-200" },
    }[status];
    const endsOnStr = new Date(currentDeal.expiresAt).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
    const startsOnStr = new Date(currentDeal.startsAt).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
    return (
      <>
        <Card className="border-orange-200 bg-orange-50/10 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge className={statusConfig.classes}>
                  {statusConfig.label}
                </Badge>
                {selectedBizRow && businesses.length > 1 && (
                  <select
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                    value={selectedBizId ?? ""}
                    onChange={e => setSelectedBizId(Number(e.target.value))}
                  >
                    {businesses.map(r => (
                      <option key={r.business.id} value={r.business.id}>{r.business.businessName}</option>
                    ))}
                  </select>
                )}
              </div>
              {status === "active" && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Ends in:</div>
                  <DealCountdownSeller expiresAt={currentDeal.expiresAt} />
                  <div className="text-xs text-muted-foreground mt-0.5">Ends on: {endsOnStr}</div>
                </div>
              )}
              {status === "scheduled" && (
                <div className="text-right text-xs text-blue-700">
                  <div>Starts: {startsOnStr}</div>
                  <div className="text-muted-foreground">Ends: {endsOnStr}</div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-lg text-foreground">{currentDeal.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{currentDeal.description}</p>
              {currentDeal.offerPrice && (
                <p className="text-base font-extrabold text-orange-600 mt-2">Offer Price: {currentDeal.offerPrice}</p>
              )}
            </div>

            {/* Performance Analytics */}
            <div className="border-t border-border/40 pt-4">
              <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Deal Performance</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg border border-border/20 text-center">
                  <span className="text-sm text-muted-foreground">👀 Views</span>
                  <p className="text-xl font-extrabold mt-0.5">{currentDeal.views}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg border border-border/20 text-center">
                  <span className="text-sm text-muted-foreground">💬 WhatsApp Clicks</span>
                  <p className="text-xl font-extrabold mt-0.5">{currentDeal.whatsappClicks}</p>
                </div>
              </div>
            </div>

            {/* Seller Actions */}
            <div className="border-t border-border/40 pt-4 flex gap-3">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                onClick={openEditMode}
              >
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                Edit Deal
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => setConfirmEnd(true)}
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                End Deal Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* End Deal Confirmation Modal */}
        {confirmEnd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base">End this Daily Deal?</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">This will immediately remove the deal from all buyer pages.</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 mb-5 text-sm">
                <p className="font-semibold">{currentDeal.title}</p>
                {currentDeal.offerPrice && <p className="text-muted-foreground text-xs mt-0.5">{currentDeal.offerPrice}</p>}
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={endDeal.isPending}
                  onClick={() => endDeal.mutate()}
                >
                  {endDeal.isPending ? "Ending…" : "Yes, End Deal"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={endDeal.isPending}
                  onClick={() => setConfirmEnd(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Edit mode: pre-filled form for updating an existing deal
  if (editMode && currentDeal) {
    return (
      <Card className="border-orange-300 bg-orange-50/5">
        <CardContent className="p-5">
          <h4 className="font-bold mb-3 text-orange-800">Edit Daily Deal</h4>
          <div className="space-y-3">
            <Input placeholder="Deal title (e.g. Buy 5 get 1 free)" value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea placeholder="Describe the offer…" rows={2} className="resize-none bg-white" value={description} onChange={e => setDescription(e.target.value)} />
            <Input placeholder="Discount / Offer Price (e.g. ₹150, 20% OFF)" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start Date & Time <span className="text-muted-foreground/60">(in your local time)</span></label>
              <Input type="datetime-local" min={nowStr} value={startsAt} onChange={e => handleStartChange(e.target.value)} className="bg-white" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Expiry Date & Time <span className="text-muted-foreground/60">(must be after start time)</span></label>
              <Input type="datetime-local" min={startsAt || nowStr} value={expiresAt} onChange={e => handleExpiryChange(e.target.value)} className="bg-white" />
            </div>
            {validationError && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                <span>⚠</span> {validationError}
              </p>
            )}
            <div className="flex gap-3">
              <Button 
                size="sm" 
                className="bg-orange-500 hover:bg-orange-600 text-white" 
                disabled={!title || !description || !expiresAt || !startsAt || !!validationError || update.isPending} 
                onClick={() => update.mutate()}
              >
                {update.isPending ? "Saving…" : "Save Changes"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEditMode(false); setValidationError(""); }}>Cancel</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Otherwise, show the creation form or a button to open it
  if (!open) {
    return (
      <div className="space-y-4">
        {businesses.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Select Business:</span>
            <select
              className="rounded-md border border-input bg-background px-2 py-1 text-xs"
              value={selectedBizId ?? ""}
              onChange={e => setSelectedBizId(Number(e.target.value))}
            >
              {businesses.map(r => (
                <option key={r.business.id} value={r.business.id}>{r.business.businessName}</option>
              ))}
            </select>
          </div>
        )}
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50/50 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
            <span className="text-orange-600 text-lg">🔥</span>
          </div>
          <div>
            <p className="font-semibold text-sm">Create a Daily Deal</p>
            <p className="text-xs text-muted-foreground">Limited-time offer with countdown timer to get more visibility.</p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <Card className="border-orange-300 bg-orange-50/5">
      <CardContent className="p-5">
        <h4 className="font-bold mb-3 text-orange-800">Create a Daily Deal</h4>
        <div className="space-y-3">
          {businesses.length > 1 && (
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedBizId ?? ""}
              onChange={e => setSelectedBizId(Number(e.target.value))}
            >
              {businesses.map(r => (
                <option key={r.business.id} value={r.business.id}>{r.business.businessName}</option>
              ))}
            </select>
          )}
          <Input placeholder="Deal title (e.g. Buy 5 get 1 free)" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Describe the offer…" rows={2} className="resize-none bg-white" value={description} onChange={e => setDescription(e.target.value)} />
          <Input placeholder="Discount / Offer Price (e.g. ₹150, 20% OFF)" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} />
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Start Date & Time <span className="text-muted-foreground/60">(in your local time)</span></label>
            <Input type="datetime-local" min={nowStr} value={startsAt} onChange={e => handleStartChange(e.target.value)} className="bg-white" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Expiry Date & Time <span className="text-muted-foreground/60">(must be after start time)</span></label>
            <Input type="datetime-local" min={startsAt || nowStr} value={expiresAt} onChange={e => handleExpiryChange(e.target.value)} className="bg-white" />
          </div>
          {validationError && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <span>⚠</span> {validationError}
            </p>
          )}
          <div className="flex gap-3">
            <Button 
              size="sm" 
              className="bg-orange-500 hover:bg-orange-600 text-white" 
              disabled={!title || !description || !expiresAt || !startsAt || !!validationError || !selectedBizId || create.isPending} 
              onClick={() => create.mutate()}
            >
              {create.isPending ? "Creating…" : "Create Deal"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setOpen(false); setValidationError(""); }}>Cancel</Button>
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

  const [dismissedCelebration, setDismissedCelebration] = useState(() => {
    if (typeof window !== "undefined" && user?.id) {
      return localStorage.getItem(`hustly_dismiss_first_enquiry_${user.id}`) === "true";
    }
    return false;
  });

  const [dismissedApproval, setDismissedApproval] = useState(() => {
    if (typeof window !== "undefined" && user?.id) {
      return localStorage.getItem(`hustly_dismiss_approval_${user.id}`) === "true";
    }
    return false;
  });

  useEffect(() => {
    if (user?.id) {
      setDismissedCelebration(localStorage.getItem(`hustly_dismiss_first_enquiry_${user.id}`) === "true");
      setDismissedApproval(localStorage.getItem(`hustly_dismiss_approval_${user.id}`) === "true");
    }
  }, [user?.id]);

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

  const hasFirstEnquiry = !analyticsLoading && analytics && analytics.totalLeads >= 1;
  const showCelebrationBanner = hasFirstEnquiry && !dismissedCelebration;

  const dismissCelebration = () => {
    if (user?.id) {
      localStorage.setItem(`hustly_dismiss_first_enquiry_${user.id}`, "true");
    }
    setDismissedCelebration(true);
  };

  const hasApprovedListing = !bizLoading && businesses?.some(r => r.business.status === "approved");
  const showApprovalBanner = hasApprovedListing && !dismissedApproval;

  const dismissApproval = () => {
    if (user?.id) {
      localStorage.setItem(`hustly_dismiss_approval_${user.id}`, "true");
    }
    setDismissedApproval(true);
  };

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

        {/* First Customer Enquiry Celebration Banner */}
        {showCelebrationBanner && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 shadow-sm flex justify-between items-start gap-4 relative">
              <div className="flex-1">
                <h4 className="font-bold text-green-800 text-sm flex items-center gap-1.5">
                  🎉 Congratulations!
                </h4>
                <p className="text-xs text-green-700 mt-1 leading-relaxed">
                  You received your first customer enquiry from GoHustly!
                  <br />
                  Your business is now reaching nearby customers.
                  <br />
                  Keep your profile updated to receive even more enquiries.
                </p>
              </div>
              <button 
                onClick={dismissCelebration}
                className="text-green-600 hover:text-green-800 transition-colors p-1"
                aria-label="Dismiss banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Business Approved Banner */}
        {showApprovalBanner && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="p-4 rounded-xl bg-green-50 border border-green-300 shadow-sm flex justify-between items-start gap-4">
              <div className="flex-1">
                <h4 className="font-bold text-green-800 text-sm">
                  🎉 Congratulations! Your business has been approved.
                </h4>
                <p className="text-xs text-green-700 mt-1 leading-relaxed">
                  Your business is now live on GoHustly and reaching nearby customers.
                  Keep your profile updated to receive more enquiries.
                </p>
              </div>
              <button
                onClick={dismissApproval}
                className="text-green-600 hover:text-green-800 transition-colors p-1"
                aria-label="Dismiss approval banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Lead reminder */}
        {!analyticsLoading && analytics && analytics.leadsThisMonth > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <Bell className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm font-medium">
                You received <strong>{analytics.leadsThisMonth} leads</strong> from GoHustly this month. Keep the momentum going!
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
        {businesses && businesses.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-base font-bold text-foreground">Engage Your Community</h2>
            <CreateDealForm businesses={businesses} onUpgrade={setUpgradeBizId} />
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
                          <div className="mt-3 p-4 rounded-xl bg-red-50 border border-red-200 space-y-3">
                            <div>
                              <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">Status:</span>
                              <span className="text-sm font-semibold text-red-700">Rejected</span>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">Message:</span>
                              <p className="text-sm text-red-700">Your listing was rejected.</p>
                            </div>
                            {biz.rejectionReason && (
                              <div>
                                <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">Reason:</span>
                                <p className="text-sm text-red-600 bg-white/60 p-2.5 rounded-lg border border-red-100 mt-1 leading-relaxed">
                                  {biz.rejectionReason}
                                </p>
                              </div>
                            )}
                            <div className="pt-1">
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                                onClick={() => setLocation(`/sell/edit/${biz.id}`)}
                              >
                                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit & Resubmit
                              </Button>
                            </div>
                          </div>
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
