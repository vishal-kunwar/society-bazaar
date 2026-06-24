import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, useClerk } from "@clerk/react";
import { motion } from "framer-motion";
import {
  MapPin, Star, TrendingUp, MessageCircle, Eye, Plus,
  Clock, CheckCircle2, XCircle, ChevronRight, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type BusinessRow } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_ICONS = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

export default function SellerDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { toast } = useToast();

  const { data: myBusinesses, isLoading } = useQuery({
    queryKey: ["my-businesses"],
    queryFn: () => api.businesses.mine(),
  });

  const totalLeads = myBusinesses?.reduce((sum, b) => sum + Number(b.leadCount), 0) ?? 0;
  const avgRating = myBusinesses?.length
    ? (myBusinesses.reduce((sum, b) => sum + Number(b.avgRating), 0) / myBusinesses.length).toFixed(1)
    : "—";
  const approvedCount = myBusinesses?.filter(b => b.business.status === "approved").length ?? 0;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Society<span className="text-primary">Bazaar</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:block">
              {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut({ redirectUrl: basePath || "/" })}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 md:px-6 py-10 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Seller Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your home-based business listings</p>
          </div>
          <Button onClick={() => setLocation("/sell")} data-testid="button-add-business">
            <Plus className="w-4 h-4 mr-2" />
            Add New Business
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "My Listings", value: myBusinesses?.length ?? "—", icon: MapPin },
            { label: "Active Listings", value: approvedCount, icon: CheckCircle2 },
            { label: "Total Leads", value: totalLeads, icon: TrendingUp },
            { label: "Avg Rating", value: avgRating, icon: Star },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{isLoading ? "…" : stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-foreground mb-5">Your Businesses</h2>

        {isLoading && (
          <div className="grid gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && !myBusinesses?.length && (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="p-12 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground text-lg mb-2">No businesses yet</h3>
              <p className="text-muted-foreground mb-6">List your home-based business and get discovered by your society residents.</p>
              <Button onClick={() => setLocation("/sell")}>
                <Plus className="w-4 h-4 mr-2" />
                List Your First Business
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && myBusinesses?.map((row, idx) => {
          const biz = row.business;
          const StatusIcon = STATUS_ICONS[biz.status];
          return (
            <motion.div
              key={biz.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="mb-4"
            >
              <Card className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-lg text-foreground">{biz.businessName}</h3>
                        <Badge className={`text-xs font-semibold border ${STATUS_COLORS[biz.status]}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {biz.status.charAt(0).toUpperCase() + biz.status.slice(1)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">{biz.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{biz.description}</p>
                      <div className="flex items-center gap-5 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          {row.leadCount} leads
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {Number(row.avgRating).toFixed(1)} ({row.reviewCount} reviews)
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {row.society?.name ?? "—"}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setLocation(`/business/${biz.id}`)}
                    >
                      View <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </main>
    </div>
  );
}
