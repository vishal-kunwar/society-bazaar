import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Menu, X, Search, MapPin, Utensils, Cake, BookOpen, Dumbbell, Scissors, Sparkles, Wrench, MoreHorizontal, Star, MessageCircle, TrendingUp, Heart, Flame, Clock, Bell, ShoppingBag, Shirt, Palette, Hammer, Dog, Camera, Gift, Monitor, Car, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api, type BusinessRow, type DealRow, type FeedPostRow } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import { useUser, UserButton } from "@clerk/react";


const CATEGORY_IMAGES: Record<string, string> = {
  "Food & Tiffin": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
  "Bakery & Sweets": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80",
  "Retail & Daily Needs": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80",
  "Clothing & Fashion": "https://images.unsplash.com/photo-1489987707023-afc31e4198fa?w=600&q=80",
  "Beauty & Wellness": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
  "Salon at Home": "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&q=80",
  "Fitness, Yoga & Zumba": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
  "Tuition & Classes": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80",
  "Arts, Music & Hobby Classes": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80",
  "Tailoring & Boutique": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80",
  "Home Services": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "Repairs & Maintenance": "https://images.unsplash.com/photo-1416886885375-9e623dc58778?w=600&q=80",
  "Pet Care": "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80",
  "Photography & Events": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80",
  "Gifts & Handmade": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
  "Tech & Digital Services": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80",
  "Travel & Transport": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
  "Others": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
};


const CATEGORIES = [
  { name: "Food & Tiffin", icon: Utensils },
  { name: "Bakery & Sweets", icon: Cake },
  { name: "Retail & Daily Needs", icon: ShoppingBag },
  { name: "Clothing & Fashion", icon: Shirt },
  { name: "Beauty & Wellness", icon: Sparkles },
  { name: "Salon at Home", icon: Scissors },
  { name: "Fitness, Yoga & Zumba", icon: Dumbbell },
  { name: "Tuition & Classes", icon: BookOpen },
  { name: "Arts, Music & Hobby Classes", icon: Palette },
  { name: "Tailoring & Boutique", icon: Scissors },
  { name: "Home Services", icon: Wrench },
  { name: "Repairs & Maintenance", icon: Hammer },
  { name: "Pet Care", icon: Dog },
  { name: "Photography & Events", icon: Camera },
  { name: "Gifts & Handmade", icon: Gift },
  { name: "Tech & Digital Services", icon: Monitor },
  { name: "Travel & Transport", icon: Car },
  { name: "Others", icon: Briefcase }
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
          onError={(e) => {
            const fallback = CATEGORY_IMAGES[biz.category] || CATEGORY_IMAGES["Others"];
            if (e.currentTarget.src !== fallback) {
              e.currentTarget.src = fallback;
            }
          }}
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
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${isFav ? "bg-red-500" : "bg-white/90 hover:bg-white"
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
            <MapPin className="w-3 h-3 shrink-0" />{row.society ? `${row.society.name}${row.society.locality ? `, ${row.society.locality}` : ""}` : "—"}
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
  const { isSignedIn } = useUser();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLocality, setSelectedLocality] = useState<string>("all");
  const [selectedSociety, setSelectedSociety] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState<string>("");
  const [showCityModal, setShowCityModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("hustly_city");
    if (saved) {
      setCity(saved);
    } else {
      setShowCityModal(true);
    }
  }, []);

  const handleCitySelect = (c: string) => {
    setCity(c);
    localStorage.setItem("hustly_city", c);
    setShowCityModal(false);
    setSelectedLocality("all");
    setSelectedSociety("all");
  };

  const { data: allSocietiesInCity } = useQuery({
    queryKey: ["societies-city", city],
    queryFn: () => api.societies.list(city || undefined),
    enabled: !!city
  });

  const localities = Array.from(new Set(allSocietiesInCity?.map(s => s.locality).filter(Boolean))) as string[];

  const { data: societiesInLocality } = useQuery({
    queryKey: ["societies-locality", city, selectedLocality],
    queryFn: () => api.societies.list(city || undefined, selectedLocality === "all" ? undefined : selectedLocality),
    enabled: !!city
  });

  const { data: businesses, isLoading: bizLoading } = useQuery({
    queryKey: ["businesses", selectedSociety, selectedLocality, selectedCategory, city],
    queryFn: () => api.businesses.list({
      societyId: selectedSociety !== "all" ? Number(selectedSociety) : undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      city: city || undefined,
      locality: selectedLocality !== "all" ? selectedLocality : undefined,
    }),
    enabled: !!city,
  });
  const { data: deals } = useQuery({ queryKey: ["deals"], queryFn: () => api.deals.list() });
  const { data: feed } = useQuery({
    queryKey: ["feed", selectedSociety],
    queryFn: () => api.feed.list(selectedSociety !== "all" ? Number(selectedSociety) : undefined),
  });

  const handleWhatsApp = useCallback((businessId: number, whatsapp: string) => {
    api.leads.track(businessId).catch(() => { });
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
      <Navbar
        leftContent={
          city && (
            <Select value={city} onValueChange={handleCitySelect}>
              <SelectTrigger className="w-[120px] h-8 text-xs bg-muted/50 border-none">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                <SelectItem value="Noida">Noida</SelectItem>
                <SelectItem value="Pune">Pune</SelectItem>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
                <SelectItem value="Bangalore">Bangalore</SelectItem>
                <SelectItem value="Hyderabad">Hyderabad</SelectItem>
              </SelectContent>
            </Select>
          )
        }
        rightContent={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/seller-landing")}
            >
              List Your Business
            </Button>
            {isSignedIn ? (
              <div className="flex items-center gap-2 border-l border-border/40 pl-2 ml-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/dashboard")}
                >
                  Dashboard
                </Button>
                <div className="h-8 w-8 flex items-center justify-center">
                  <UserButton />
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => setLocation("/sign-in")}
              >
                Seller Login
              </Button>
            )}
          </>
        }
        mobileContent={
          <>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start w-full"
              onClick={() => { document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}
            >
              Explore
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start w-full"
              onClick={() => { setLocation("/seller-landing"); }}
            >
              List Your Business
            </Button>
            {isSignedIn ? (
              <Button
                variant="outline"
                size="sm"
                className="justify-start w-full"
                onClick={() => { setLocation("/dashboard"); }}
              >
                Dashboard
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="justify-start w-full"
                onClick={() => { setLocation("/sign-in"); }}
              >
                Seller Login
              </Button>
            )}
          </>
        }
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background pt-20 pb-28 border-b border-border/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-primary/20">
              <Flame className="w-3.5 h-3.5" />500+ home hustles listed · Connect directly on WhatsApp
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-5">
              Discover trusted local businesses<br />
              <span className="text-primary">in your neighbourhood.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Find home chefs, tutors, bakers, tailors and more around you.
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
                onClick={() => setLocation("/seller-landing")}
              >
                List Your Business
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">No sign-up required to explore businesses.</p>
          </motion.div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-12 border-b border-border/30 bg-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${selectedCategory === "all"
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
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${selectedCategory === cat.name
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
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={selectedLocality} onValueChange={(val) => {
                setSelectedLocality(val);
                setSelectedSociety("all");
              }}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Localities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Localities</SelectItem>
                  {localities.sort().map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSociety} onValueChange={setSelectedSociety}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Societies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Societies</SelectItem>
                  {societiesInLocality?.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="rounded-xl bg-muted animate-pulse h-72" />
              ))}
            </div>
          )}

          {!bizLoading && filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No businesses found in {city}</h3>
              <p className="text-muted-foreground text-sm mb-6">Try adjusting your filters or select a different city to find home businesses.</p>
              <Button variant="outline" onClick={() => setShowCityModal(true)}>Change City</Button>
            </div>
          )}

          {!bizLoading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((row, idx) => (
                <motion.div key={row.business.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <BusinessCard
                    row={row}
                    isFav={false}
                    onToggleFav={() => { }}
                    favPending={false}
                    onWhatsApp={handleWhatsApp}
                    onClick={(id) => setLocation(`/business/${id}`)}
                    showFavButton={false}
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
                        <MapPin className="w-3 h-3 text-primary" />{row.business.businessName} · {row.society ? `${row.society.name}${row.society.locality ? `, ${row.society.locality}` : ""}` : "—"}
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
                    isFav={false}
                    onToggleFav={() => { }}
                    favPending={false}
                    onWhatsApp={handleWhatsApp}
                    onClick={(id) => setLocation(`/business/${id}`)}
                    showFavButton={false}
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
              {feed.map((row: FeedPostRow, idx: number) => (
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
                        {row.business.businessName} · {row.society ? `${row.society.name}${row.society.locality ? `, ${row.society.locality}` : ""}` : "—"}
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
              Discover and support talented home chefs, bakers, and local services in your community.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button onClick={() => setLocation("/seller-landing")} className="hover:text-foreground transition-colors">List Your Business</button>
              <button onClick={() => setLocation("/sign-in")} className="hover:text-foreground transition-colors">Sign In</button>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm text-muted-foreground">
            <button onClick={() => setLocation("/about")} className="hover:text-foreground transition-colors">About Us</button>
            <button onClick={() => setLocation("/contact")} className="hover:text-foreground transition-colors">Contact Us</button>
            <button onClick={() => setLocation("/terms")} className="hover:text-foreground transition-colors">Terms & Conditions</button>
            <button onClick={() => setLocation("/refund")} className="hover:text-foreground transition-colors">Refund & Cancellation</button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">
            © {new Date().getFullYear()} Hustly. Your neighbourhood marketplace.
            <button onClick={() => setLocation("/admin")} className="opacity-0 hover:opacity-30 ml-2 cursor-default hover:cursor-pointer transition-opacity text-[10px]">admin</button>
          </p>
        </div>
      </footer>

      {/* City Selection Modal */}
      {showCityModal && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card text-card-foreground shadow-xl rounded-2xl p-6 w-full max-w-sm border border-border"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 mx-auto">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Welcome to Hustly</h2>
            <p className="text-center text-muted-foreground mb-6">Select your city to discover local home businesses around you.</p>
            <div className="grid grid-cols-2 gap-3">
              {["Delhi", "Gurgaon", "Noida", "Pune", "Mumbai", "Bangalore", "Hyderabad"].map(c => (
                <Button
                  key={c}
                  variant="outline"
                  onClick={() => handleCitySelect(c)}
                  className="font-semibold"
                >
                  {c}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}


