import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Menu, X, Search, MapPin, Utensils, Cake, BookOpen, Dumbbell,
  Scissors, Sparkles, Wrench, MoreHorizontal, Star, MessageCircle,
  TrendingUp, CheckCircle2, ShieldCheck, Heart, Flame, Clock,
  LayoutDashboard, Users, Zap, ChevronRight, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Show, useClerk, useUser, UserButton } from "@clerk/react";
import { api, type BusinessRow, type DealRow, type FeedPostRow } from "@/lib/api";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const CATEGORY_IMAGES: Record<string, string> = {
  "Food & Tiffin": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
  "Bakery & Sweets": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80",
  "Tuition & Classes": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80",
  "Fitness & Yoga": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
  "Tailoring": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80",
  "Beauty & Wellness": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
  "Home Services": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "Others": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
};

const CATEGORIES = [
  { name: "Food & Tiffin", icon: Utensils },
  { name: "Bakery & Sweets", icon: Cake },
  { name: "Tuition & Classes", icon: BookOpen },
  { name: "Fitness & Yoga", icon: Dumbbell },
  { name: "Tailoring", icon: Scissors },
  { name: "Beauty & Wellness", icon: Sparkles },
  { name: "Home Services", icon: Wrench },
  { name: "Others", icon: MoreHorizontal },
];

function getTimeRemaining(expiresAt: string) {
  const total = new Date(expiresAt).getTime() - Date.now();
  if (total <= 0) return null;
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

function DealCountdown({ expiresAt }: { expiresAt: string }) {
  const [time, setTime] = useState(() => getTimeRemaining(expiresAt));
  useEffect(() => {
    const t = setInterval(() => setTime(getTimeRemaining(expiresAt)), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  if (!time) return <span className="text-xs text-red-500 font-semibold">Expired</span>;
  if (time.days > 0) return <span className="text-xs font-bold text-orange-700">{time.days}d {time.hours}h left</span>;
  return (
    <span className="text-xs font-bold text-red-600 tabular-nums">
      {String(time.hours).padStart(2, "0")}:{String(time.minutes).padStart(2, "0")}:{String(time.seconds).padStart(2, "0")} left
    </span>
  );
}

function isNewBusiness(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;
}

interface BusinessCardProps {
  row: BusinessRow;
  isFav: boolean;
  onToggleFav: (id: number) => void;
  favPending: boolean;
  onWhatsApp: (id: number, whatsapp: string) => void;
  onClick: (id: number) => void;
  showFavButton: boolean;
}

function BusinessCard({ row, isFav, onToggleFav, favPending, onWhatsApp, onClick, showFavButton }: BusinessCardProps) {
  const biz = row.business;
  const imgUrl = biz.imageUrl || CATEGORY_IMAGES[biz.category] || CATEGORY_IMAGES["Others"];
  const _isNew = isNewBusiness(biz.createdAt);
  const isTrending = Number(row.leadCount) >= 3;

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer">
      <div className="relative h-44 overflow-hidden" onClick={() => onClick(biz.id)}>
        <img
          src={imgUrl}
          alt={biz.businessName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          {_isNew && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow">✨ New</span>
          )}
          {isTrending && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5" />Hot
            </span>
          )}
        </div>
        {showFavButton && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFav(biz.id); }}
            disabled={favPending}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
              isFav ? "bg-red-500" : "bg-white/90 hover:bg-white"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? "text-white fill-white" : "text-gray-500"}`} />
          </button>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2" onClick={() => onClick(biz.id)}>
          <h3 className="font-bold text-foreground leading-tight mb-0.5 truncate">{biz.businessName}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />{row.society?.name ?? "—"}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            {Number(row.avgRating).toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-primary" />
            {row.leadCount} leads
          </span>
          <Badge variant="secondary" className="text-[10px] px-1.5 ml-auto">{biz.category}</Badge>
        </div>
        <button
          onClick={() => onWhatsApp(biz.id, biz.whatsapp)}
          className="w-full inline-flex items-center justify-center rounded-lg h-9 text-sm font-semibold bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors"
        >
          <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp
        </button>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { signOut, openSignIn } = useClerk();
  const { user } = useUser();
  const qc = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: societies } = useQuery({ queryKey: ["societies"], queryFn: () => api.societies.list() });
  const { data: businesses, isLoading: bizLoading } = useQuery({
    queryKey: ["businesses", selectedSociety, selectedCategory],
    queryFn: () => api.businesses.list({
      societyId: selectedSociety !== "all" ? Number(selectedSociety) : undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
    }),
  });
  const { data: deals } = useQuery({ queryKey: ["deals"], queryFn: () => api.deals.list() });
  const { data: feed } = useQuery({
    queryKey: ["feed", selectedSociety],
    queryFn: () => api.feed.list(selectedSociety !== "all" ? Number(selectedSociety) : undefined),
  });
  const { data: favIds } = useQuery({
    queryKey: ["favourite-ids"],
    queryFn: () => api.favourites.ids(),
    enabled: !!user,
  });

  const toggleFav = useMutation({
    mutationFn: (id: number) => api.favourites.toggle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favourite-ids"] });
      qc.invalidateQueries({ queryKey: ["favourites"] });
    },
  });

  const handleWhatsApp = useCallback((businessId: number, whatsapp: string) => {
    api.leads.track(businessId).catch(() => {});
    const msg = encodeURIComponent("Hi, I found your business on Hustly and would like to know more.");
    window.open(`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
  }, []);

  const filtered = businesses?.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.business.businessName.toLowerCase().includes(q) ||
      r.business.description.toLowerCase().includes(q) ||
      r.business.category.toLowerCase().includes(q)
    );
  }) ?? [];

  const trending = [...(businesses ?? [])].sort((a, b) => Number(b.leadCount) - Number(a.leadCount)).slice(0, 3);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">Hust<span className="text-primary">ly</span></span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <Show when="signed-in">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/favourites")}>
                <Heart className="w-4 h-4 mr-1 text-red-400" />Favourites
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
                <LayoutDashboard className="w-4 h-4 mr-1" />Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/sell")}>
                List Your Business
              </Button>
              <div className="flex items-center gap-2 border-l border-border/40 pl-2 ml-2">
                <Button variant="outline" size="sm" onClick={() => signOut({ redirectUrl: basePath || "/" })}>
                  Sign Out
                </Button>
                <div className="h-8 w-8 flex items-center justify-center">
                  <UserButton />
                </div>
              </div>
            </Show>
            <Show when="signed-out">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/sign-in")}>Sign In</Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/sign-up")}>Sign Up</Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/sell")}>
                List Your Business
              </Button>
            </Show>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="md:hidden border-t border-border/40 bg-background px-4 pb-4 pt-2 flex flex-col gap-2">
            <Show when="signed-in">
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setLocation("/favourites"); setMobileMenuOpen(false); }}>
                <Heart className="w-4 h-4 mr-2 text-red-400" />Favourites
              </Button>
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setLocation("/dashboard"); setMobileMenuOpen(false); }}>
                <LayoutDashboard className="w-4 h-4 mr-2" />Dashboard
              </Button>
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setLocation("/sell"); setMobileMenuOpen(false); }}>
                List Your Business
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut({ redirectUrl: basePath || "/" })}>Sign Out</Button>
            </Show>
            <Show when="signed-out">
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setLocation("/sign-in"); setMobileMenuOpen(false); }}>Sign In</Button>
              <Button variant="outline" size="sm" className="justify-start" onClick={() => { setLocation("/sign-up"); setMobileMenuOpen(false); }}>Sign Up</Button>
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setLocation("/sell"); setMobileMenuOpen(false); }}>
                List Your Business
              </Button>
            </Show>
          </motion.div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background pt-20 pb-28 border-b border-border/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-primary/20">
              <Flame className="w-3.5 h-3.5" />500+ home hustles listed · First 50 leads free
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-5">
              Discover trusted home businesses<br />
              <span className="text-primary">right in your society.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Support talented home chefs, bakers, tutors, and more in your community.
              <br className="hidden md:block" />Tiffin, bakeries, tutors, yoga, tailors and more — right in your society.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="font-bold text-base px-8 h-13 shadow-lg shadow-primary/20"
                onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Search className="w-5 h-5 mr-2" />Explore Businesses
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-bold text-base px-8 h-13"
                onClick={() => setLocation("/sell")}
              >
                List Your Business
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-12 border-b border-border/30 bg-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? "all" : cat.name)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${
                  selectedCategory === cat.name
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <cat.icon className="w-4 h-4" />{cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Browse ── */}
      <section id="explore" className="py-14">
        <div className="container mx-auto px-4 md:px-6">
          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, category…"
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedSociety} onValueChange={setSelectedSociety}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="All Societies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Societies</SelectItem>
                {societies?.map(s => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">
              {selectedCategory !== "all" ? selectedCategory : "All Businesses"}
              {filtered.length > 0 && <span className="text-muted-foreground font-normal text-sm ml-2">({filtered.length})</span>}
            </h2>
          </div>

          {bizLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="rounded-xl bg-muted animate-pulse h-72" />
              ))}
            </div>
          )}

          {!bizLoading && filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No businesses found</h3>
              <p className="text-muted-foreground text-sm mb-6">Try adjusting your filters or be the first to list here!</p>
              <Button onClick={() => setLocation("/sell")}>List Your Business</Button>
            </div>
          )}

          {!bizLoading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((row, idx) => (
                <motion.div key={row.business.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <BusinessCard
                    row={row}
                    isFav={favIds?.includes(row.business.id) ?? false}
                    onToggleFav={(id) => user ? toggleFav.mutate(id) : setLocation("/sign-in")}
                    favPending={toggleFav.isPending}
                    onWhatsApp={handleWhatsApp}
                    onClick={(id) => setLocation(`/business/${id}`)}
                    showFavButton={true}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Daily Deals ── */}
      {deals && deals.length > 0 && (
        <section className="py-14 bg-gradient-to-b from-orange-50 to-background border-y border-orange-100">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Daily Deals</h2>
                <p className="text-sm text-muted-foreground">Limited-time offers from local sellers</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {deals.map((row: DealRow, idx) => (
                <motion.div key={row.deal.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
                  <Card className="border-orange-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs font-semibold">
                          <Flame className="w-3 h-3 mr-1" />Deal
                        </Badge>
                        <DealCountdown expiresAt={row.deal.expiresAt} />
                      </div>
                      <h3 className="font-bold mb-1 text-foreground">{row.deal.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{row.deal.description}</p>
                      <p className="text-xs font-medium text-foreground flex items-center gap-1 mb-4">
                        <MapPin className="w-3 h-3 text-primary" />{row.business.businessName} · {row.society?.name ?? "—"}
                      </p>
                      <button
                        onClick={() => handleWhatsApp(row.business.id, row.business.whatsapp)}
                        className="w-full inline-flex items-center justify-center rounded-lg h-9 text-sm font-semibold bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 mr-1.5" />Claim Deal
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Trending This Week ── */}
      {trending.length > 0 && (
        <section className="py-14 bg-muted/30 border-y border-border/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Trending This Week</h2>
                  <p className="text-sm text-muted-foreground">Most contacted home businesses</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {trending.map((row, idx) => (
                <motion.div key={row.business.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
                  <BusinessCard
                    row={row}
                    isFav={favIds?.includes(row.business.id) ?? false}
                    onToggleFav={(id) => user ? toggleFav.mutate(id) : setLocation("/sign-in")}
                    favPending={toggleFav.isPending}
                    onWhatsApp={handleWhatsApp}
                    onClick={(id) => setLocation(`/business/${id}`)}
                    showFavButton={!!user}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Society Feed ── */}
      {feed && feed.length > 0 && (
        <section className="py-14 border-b border-border/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Community Updates</h2>
                <p className="text-sm text-muted-foreground">Latest from your neighbourhood sellers</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {feed.map((row: FeedPostRow, idx) => (
                <motion.div key={row.post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
                  <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    {row.post.imageUrl && (
                      <div className="h-36 overflow-hidden">
                        <img src={row.post.imageUrl} alt={row.post.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3 text-primary" />
                        {row.business.businessName} · {row.society?.name ?? "—"}
                        <span className="ml-auto">{new Date(row.post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      </p>
                      <h3 className="font-bold mb-1 text-foreground leading-snug">{row.post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{row.post.body}</p>
                      <button
                        onClick={() => handleWhatsApp(row.business.id, row.business.whatsapp)}
                        className="mt-4 w-full inline-flex items-center justify-center rounded-lg h-8 text-sm font-semibold bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 mr-1.5" />WhatsApp
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── For Sellers ── */}
      <section className="py-20 bg-primary text-primary-foreground" id="for-sellers">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">For Sellers: Grow Your Home Business</h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of sellers earning from home. First 50 leads completely free.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                size="lg"
                variant="secondary"
                className="font-bold text-base px-8"
                onClick={() => setLocation("/sell")}
              >
                List Your Business — It's Free
              </Button>
              <Show when="signed-in">
                <Button
                  size="lg"
                  variant="outline"
                  className="font-bold text-base px-8 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => setLocation("/dashboard")}
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />View Dashboard
                </Button>
              </Show>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Why Hustly ── */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-14">Why sellers love Hustly</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Live in Minutes", body: "List your business and start getting WhatsApp leads the same day. No setup fees, no tech skills needed." },
              { icon: Users, title: "Hyper-Local Reach", body: "Your listing appears to people in your own society and neighbourhood — buyers who are just steps away." },
              { icon: ShieldCheck, title: "Free to Start", body: "First 50 leads are completely free. After that, just ₹199/month — less than a meal out." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="border-border/40 h-full">
                  <CardContent className="p-7">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.body}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">Simple, honest pricing</h2>
          <p className="text-center text-muted-foreground mb-12">Start free. Scale with your hustle.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 border-primary/30 bg-primary/5 shadow-lg">
              <CardContent className="p-8">
                <div className="inline-block bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4">Founding Seller</div>
                <div className="text-4xl font-extrabold mb-1">₹0</div>
                <p className="text-sm text-muted-foreground mb-6">First 50 leads OR 90 days, whichever comes first</p>
                <ul className="space-y-2.5 mb-8">
                  {["50 free WhatsApp leads", "90-day free trial", "Business listing page", "Society Feed posts", "Daily Deals", "Review collection"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full font-bold" onClick={() => setLocation("/sell")}>
                  <Zap className="w-4 h-4 mr-2" />Start Free
                </Button>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-8">
                <div className="inline-block bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full mb-4">After Trial</div>
                <div className="text-4xl font-extrabold mb-1">₹199<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                <p className="text-sm text-muted-foreground mb-6">Unlimited leads for one low monthly price</p>
                <ul className="space-y-2.5 mb-8">
                  {["Unlimited WhatsApp leads", "Priority listing", "Analytics dashboard", "All Free features", "Cancel anytime"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full font-bold">Coming Soon</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-muted/20 border-t border-border/30">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-extrabold text-center mb-12">What sellers say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Priya Sharma", cat: "Tiffin Service", body: "Got my first 5 customers within a week of listing. Hustly is a game-changer for home chefs!", city: "Mumbai" },
              { name: "Meena Patel", cat: "Bakery & Sweets", body: "I was scared nobody would find me. Now I get WhatsApp orders every single day from my neighbours.", city: "Pune" },
              { name: "Rohan Gupta", cat: "Tuition Classes", body: "The free trial is genuinely free — no hidden catches. My classes are full and I haven't paid a rupee yet.", city: "Bangalore" },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="border-border/40 h-full">
                  <CardContent className="p-6">
                    <div className="flex mb-3">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.body}"</p>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.cat} · {t.city}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Admin CTA (show to admins) ── */}
      <section className="py-10 bg-muted/30 border-t border-border/30">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Show when="signed-in">
            <button
              onClick={() => setLocation("/admin")}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />Admin Dashboard
            </button>
          </Show>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 bg-background py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <MapPin className="text-primary-foreground w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl">Hust<span className="text-primary">ly</span></span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Turn your side hustle into a trusted local business. · <a href="https://GetHustly.shop" className="text-primary hover:underline">GetHustly.shop</a>
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button onClick={() => setLocation("/sell")} className="hover:text-foreground transition-colors">List Your Business</button>
              <button onClick={() => setLocation("/sign-in")} className="hover:text-foreground transition-colors">Sign In</button>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">
            © {new Date().getFullYear()} Hustly. Your neighbourhood marketplace.
          </p>
        </div>
      </footer>
    </div>
  );
}


