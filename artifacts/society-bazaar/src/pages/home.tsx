import { useState } from "react";
import { motion } from "framer-motion";
import {
  Menu, X, Search, MapPin, Utensils, Cake, BookOpen, Dumbbell,
  Scissors, Sparkles, Wrench, MoreHorizontal, Star, MessageCircle,
  TrendingUp, CheckCircle2, ShieldCheck, ChevronRight, Users,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Show, useClerk, useUser } from "@clerk/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const CATEGORY_IMAGES: Record<string, string> = {
  "Food & Tiffin": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
  "Bakery & Sweets": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
  "Tuition & Classes": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
  "Fitness & Yoga": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
  "Tailoring": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
  "Beauty & Wellness": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
  "Home Services": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
  "Others": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
};

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedSocietyId, setSelectedSocietyId] = useState<string>("");
  const [, setLocation] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  const { data: societies } = useQuery({
    queryKey: ["societies"],
    queryFn: () => api.societies.list(),
  });

  const { data: businessRows, isLoading: bizLoading } = useQuery({
    queryKey: ["businesses", selectedSocietyId],
    queryFn: () => api.businesses.list(selectedSocietyId ? { societyId: Number(selectedSocietyId) } : {}),
  });

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleWhatsApp = (businessId: number, whatsapp: string, businessName: string) => {
    api.leads.track(businessId, "whatsapp").catch(() => {});
    const msg = encodeURIComponent(
      "Hi, I found your business on Society Bazaar and would like to know more."
    );
    window.open(`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
  };

  const categories = [
    { icon: Utensils, label: "Food & Tiffin" },
    { icon: Cake, label: "Bakery & Sweets" },
    { icon: BookOpen, label: "Tuition & Classes" },
    { icon: Dumbbell, label: "Fitness & Yoga" },
    { icon: Scissors, label: "Tailoring" },
    { icon: Sparkles, label: "Beauty & Wellness" },
    { icon: Wrench, label: "Home Services" },
    { icon: MoreHorizontal, label: "Others" },
  ];

  const testimonials = [
    { name: "Ramesh K.", location: "B-Wing", text: "I used to struggle finding a reliable tiffin service. Found Priya's kitchen through the Bazaar and it's been a lifesaver. The food feels just like home." },
    { name: "Anita Shah", location: "Tower 2", text: "Such a brilliant initiative! I started offering my baking services here and got 20 orders in the first week from my own society." },
    { name: "Kiran Mehta", location: "C-Block", text: "Booked a yoga instructor for the morning terrace sessions. It's so convenient to have trusted professionals right in our own complex." },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection("home")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              Society<span className="text-primary">Bazaar</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("home")} data-testid="link-home" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</button>
            <button onClick={() => scrollToSection("categories")} data-testid="link-categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Categories</button>
            <button onClick={() => scrollToSection("sellers")} data-testid="link-sellers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sellers</button>
            <button onClick={() => scrollToSection("pricing")} data-testid="link-pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Show when="signed-out">
              <Button variant="ghost" onClick={() => setLocation("/sign-in")} data-testid="button-sign-in">Sign In</Button>
              <Button className="font-semibold shadow-sm hover-elevate" onClick={() => setLocation("/sign-up")} data-testid="button-sign-up">
                Start Selling Today
              </Button>
            </Show>
            <Show when="signed-in">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} data-testid="button-dashboard">
                My Dashboard
              </Button>
              <Button className="font-semibold shadow-sm hover-elevate" onClick={() => setLocation("/sell")} data-testid="button-list-business">
                List Your Business
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut({ redirectUrl: basePath || "/" })} data-testid="button-sign-out">
                Sign Out
              </Button>
            </Show>
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border/40 shadow-lg py-4 px-4 flex flex-col gap-4 z-50">
            <button onClick={() => scrollToSection("home")} className="text-left text-sm font-medium text-foreground py-2 border-b border-border/40">Home</button>
            <button onClick={() => scrollToSection("categories")} className="text-left text-sm font-medium text-foreground py-2 border-b border-border/40">Categories</button>
            <button onClick={() => scrollToSection("sellers")} className="text-left text-sm font-medium text-foreground py-2 border-b border-border/40">Sellers</button>
            <button onClick={() => scrollToSection("pricing")} className="text-left text-sm font-medium text-foreground py-2 border-b border-border/40">Pricing</button>
            <Show when="signed-out">
              <Button variant="ghost" className="w-full" onClick={() => { setIsMobileMenuOpen(false); setLocation("/sign-in"); }}>Sign In</Button>
              <Button className="w-full" onClick={() => { setIsMobileMenuOpen(false); setLocation("/sign-up"); }}>Start Selling Today</Button>
            </Show>
            <Show when="signed-in">
              <Button variant="ghost" className="w-full" onClick={() => { setIsMobileMenuOpen(false); setLocation("/dashboard"); }}>My Dashboard</Button>
              <Button className="w-full mt-2" onClick={() => { setIsMobileMenuOpen(false); setLocation("/sell"); }}>List Your Business</Button>
            </Show>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <section id="home" className="relative pt-20 pb-28 md:pt-32 md:pb-40 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl -z-10 opacity-50" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 opacity-50" />

          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Badge variant="secondary" className="mb-6 px-4 py-1.5 rounded-full text-primary bg-primary/10 border-primary/20 font-medium text-sm">
                  <ShieldCheck className="w-4 h-4 mr-2 inline-block" />
                  Trusted by 500+ Societies
                </Badge>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
                  Turn Your Home Business Into a{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Trusted Society Brand</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                  Get discovered by residents in your apartment society. First 6 months free.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="w-full sm:w-auto text-base h-14 px-8 shadow-md hover-elevate group" onClick={() => scrollToSection("sellers")} data-testid="button-find-businesses">
                    Find Local Businesses
                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-14 px-8 border-primary/20 text-foreground hover:bg-primary/5 hover-elevate" onClick={() => setLocation("/sign-up")} data-testid="button-start-selling">
                    Start Selling Today
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-16 bg-background rounded-2xl p-2 md:p-3 shadow-xl border border-border/60 max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-3"
              >
                <div className="flex items-center flex-1 w-full px-3 md:border-r border-border">
                  <MapPin className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
                  <Select value={selectedSocietyId} onValueChange={setSelectedSocietyId}>
                    <SelectTrigger className="border-0 shadow-none focus:ring-0 px-0 font-medium h-12 w-full text-base bg-transparent" data-testid="select-society">
                      <SelectValue placeholder="Select Society" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Societies</SelectItem>
                      {societies?.map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center flex-2 w-full px-3">
                  <Search className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
                  <Input
                    type="text"
                    placeholder="Search for tiffin, tutors, tailors..."
                    className="border-0 shadow-none focus-visible:ring-0 px-0 h-12 w-full text-base bg-transparent placeholder:text-muted-foreground/70"
                    data-testid="input-search"
                  />
                </div>
                <Button size="lg" className="w-full md:w-auto h-12 rounded-xl px-8 shadow-sm" data-testid="button-search">Search</Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="py-20 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-3">What are you looking for?</h2>
              <p className="text-muted-foreground">Browse through categories to find exactly what you need.</p>
            </div>
            <div className="flex overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 lg:grid-cols-8 gap-4 snap-x">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -5 }}
                    className="snap-start shrink-0 w-32 md:w-auto flex flex-col items-center justify-center p-6 bg-background rounded-2xl border border-border shadow-sm hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground" />
                    </div>
                    <span className="text-sm font-semibold text-center text-foreground group-hover:text-primary transition-colors">{cat.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Businesses */}
        <section id="sellers" className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Businesses in Your Society</h2>
                <p className="text-lg text-muted-foreground max-w-2xl">Discover trusted neighbours offering their services. Support local, build connections.</p>
              </div>
            </div>

            {bizLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            )}

            {!bizLoading && !businessRows?.length && (
              <div className="text-center py-20 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <h3 className="font-semibold text-lg text-foreground mb-2">No businesses yet</h3>
                <p className="mb-6">Be the first to list your home business in this society.</p>
                <Button onClick={() => setLocation("/sell")}>List Your Business</Button>
              </div>
            )}

            {!bizLoading && businessRows && businessRows.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {businessRows.map((row, idx) => {
                  const biz = row.business;
                  const imgUrl = CATEGORY_IMAGES[biz.category] ?? CATEGORY_IMAGES["Others"];
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      key={biz.id}
                      data-testid={`card-business-${biz.id}`}
                    >
                      <Card
                        className="overflow-hidden border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 group hover-elevate cursor-pointer"
                        onClick={() => setLocation(`/business/${biz.id}`)}
                      >
                        <div className="h-48 overflow-hidden relative">
                          <img src={biz.imageUrl || imgUrl} alt={biz.businessName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <Badge className="bg-background/90 text-foreground backdrop-blur-sm hover:bg-background/90 border-0 font-medium">
                              {biz.category}
                            </Badge>
                            <Badge className="bg-primary/90 text-white backdrop-blur-sm border-0 font-medium">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-xl text-foreground line-clamp-1">{biz.businessName}</h3>
                            <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-md shrink-0">
                              <Star className="w-4 h-4 fill-accent text-accent" />
                              <span className="text-sm font-bold text-foreground">
                                {Number(row.avgRating).toFixed(1) !== "0.0" ? Number(row.avgRating).toFixed(1) : "New"}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {row.society?.name ?? ""}
                          </p>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{biz.description}</p>
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                            <span className="text-sm font-medium text-muted-foreground flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1.5 text-primary" />
                              {row.leadCount} leads
                            </span>
                            <button
                              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none shadow-sm h-9 px-4 py-2 bg-[#25D366] text-white hover:bg-[#20bd5a]"
                              data-testid={`button-whatsapp-${biz.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWhatsApp(biz.id, biz.whatsapp, biz.businessName);
                              }}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              WhatsApp
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="py-24 bg-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">Manage your business, your way.</h2>
                <p className="text-primary-foreground/80 text-lg md:text-xl max-w-xl mx-auto lg:mx-0">
                  Get a dedicated storefront link, track inquiries, and manage your products easily from your phone. No technical skills required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <Show when="signed-in">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto font-bold text-primary hover-elevate" onClick={() => setLocation("/dashboard")}>
                      Go to My Dashboard
                    </Button>
                  </Show>
                  <Show when="signed-out">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto font-bold text-primary hover-elevate" onClick={() => setLocation("/sign-up")}>
                      Create Store Now
                    </Button>
                  </Show>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setLocation("/sell")}>
                    See How It Works
                  </Button>
                </div>
              </div>

              <div className="lg:w-1/2 w-full">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-background rounded-2xl shadow-2xl p-6 border border-border/20 max-w-lg mx-auto"
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-xl">S</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Sugar Oven Bakery</h4>
                        <p className="text-xs text-muted-foreground">Store Active</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {[
                      { label: "Profile Views", value: "184" },
                      { label: "WhatsApp Clicks", value: "37" },
                      { label: "New Leads", value: "21" },
                      { label: "Total Leads", value: "108" },
                      { label: "Reviews", value: "12" },
                      { label: "Rating", value: "4.8" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-muted p-4 rounded-xl text-center">
                        <p className="text-xs text-muted-foreground font-medium mb-1">{stat.label}</p>
                        <p className="text-xl font-bold text-foreground flex items-center justify-center gap-1">
                          {stat.value}
                          {stat.label === "Rating" && <Star className="w-4 h-4 fill-accent text-accent" />}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6 h-40">
                    <p className="text-xs text-muted-foreground font-medium mb-2">Weekly Leads</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: "Mon", leads: 3 }, { name: "Tue", leads: 5 }, { name: "Wed", leads: 2 },
                        { name: "Thu", leads: 7 }, { name: "Fri", leads: 4 }, { name: "Sat", leads: 6 }, { name: "Sun", leads: 4 },
                      ]}>
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                        <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <Button className="w-full" variant="outline" onClick={() => setLocation("/dashboard")}>
                    View My Storefront
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Sellers Join */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why home-based sellers love us</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to run and grow your business within your community.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: MapPin, title: "Get Discovered", desc: "Get found by residents searching in your own society" },
                { icon: Users, title: "Generate Customers", desc: "Convert neighbours into loyal paying customers" },
                { icon: ShieldCheck, title: "Build Trust", desc: "Verified resident badge builds credibility fast" },
                { icon: TrendingUp, title: "Grow Your Business", desc: "Track growth with real analytics and insights" },
                { icon: MessageCircle, title: "Track Leads", desc: "Know exactly how many people enquired about your business" },
                { icon: LayoutDashboard, title: "Zero Tech Skills", desc: "Set up your storefront in minutes, no laptop needed" },
              ].map((benefit, idx) => (
                <Card key={idx} className="bg-background border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Simple, honest pricing.</h2>
              <p className="text-lg text-muted-foreground">Start for free, upgrade when you grow. No hidden fees.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="relative overflow-hidden border-border/50 shadow-md hover:shadow-xl transition-shadow bg-background">
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-bl-lg z-10">MOST POPULAR</div>
                <CardContent className="p-8 flex flex-col h-full">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Free Start</h3>
                  <div className="flex items-baseline mb-6">
                    <span className="text-5xl font-extrabold text-foreground">₹0</span>
                    <span className="text-muted-foreground ml-2">/ first 6 months</span>
                  </div>
                  <p className="text-muted-foreground mb-8 pb-8 border-b border-border/50">Perfect for getting started and testing the waters in your society.</p>
                  <ul className="space-y-4 mb-8 grow">
                    {["List unlimited products", "Direct WhatsApp inquiries", "Basic storefront profile", "Community visibility"].map((f, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-primary mr-3 shrink-0 mt-0.5" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button size="lg" className="w-full hover-elevate" onClick={() => setLocation("/sign-up")} data-testid="button-start-free">Start Free Now</Button>
                  <p className="text-xs text-center text-muted-foreground mt-4">No credit card needed</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-sm bg-background/50 relative">
                <CardContent className="p-8 flex flex-col h-full">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Growth Plan</h3>
                  <div className="flex items-baseline mb-6">
                    <span className="text-5xl font-extrabold text-foreground">₹199</span>
                    <span className="text-muted-foreground ml-2">/ month</span>
                  </div>
                  <p className="text-muted-foreground mb-8 pb-8 border-b border-border/50">For established businesses looking to expand their reach.</p>
                  <ul className="space-y-4 mb-8 grow">
                    {["Everything in Free, plus:", "Lead Analytics Dashboard", "Verified Resident Badge", "Priority Listing Placement", "Featured Homepage Slot", "Unlimited Listings"].map((f, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className={`w-5 h-5 mr-3 shrink-0 mt-0.5 ${i === 0 ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={i === 0 ? "text-foreground font-semibold" : "text-foreground"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button size="lg" variant="outline" className="w-full">Upgrade Later</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">Trusted by your neighbours</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className="bg-muted/40 p-8 rounded-2xl border border-border/50 relative"
                >
                  <div className="text-primary text-6xl font-serif absolute top-4 left-6 opacity-20">"</div>
                  <p className="text-foreground mb-6 relative z-10 italic">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{t.name}</h4>
                      <p className="text-sm text-muted-foreground">{t.location}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Admin Preview */}
        <section className="py-24 bg-foreground text-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Built for Society Admins too.</h2>
              <p className="text-lg text-background/70 max-w-2xl mx-auto">Get a birds-eye view of all businesses in your society.</p>
            </div>
            <div className="max-w-4xl mx-auto bg-background rounded-2xl shadow-2xl p-6 md:p-8 text-foreground">
              <div className="flex items-center gap-2 mb-8">
                <LayoutDashboard className="text-primary w-6 h-6" />
                <h3 className="font-bold text-xl">Society Admin Panel - Sunshine Residency</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Businesses", value: "48" },
                  { label: "Active Sellers", value: "31" },
                  { label: "Total Leads Generated", value: "1,240" },
                  { label: "Top Category", value: "Food & Tiffin" },
                ].map((stat, i) => (
                  <div key={i} className="bg-muted p-4 rounded-xl border border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-xl md:text-3xl font-bold text-primary">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-bold text-lg mb-4">Top Performing Businesses</h4>
                <div className="space-y-3">
                  {[
                    { name: "Priya's Home Tiffin", leads: 120, cat: "Food & Tiffin" },
                    { name: "Sugar Oven Bakery", leads: 85, cat: "Bakery & Sweets" },
                    { name: "Serenity Yoga", leads: 60, cat: "Fitness & Yoga" },
                  ].map((biz, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{i + 1}</div>
                        <div>
                          <p className="font-bold">{biz.name}</p>
                          <p className="text-xs text-muted-foreground">{biz.cat}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{biz.leads}</p>
                        <p className="text-xs text-muted-foreground">leads</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-background/10 pb-12 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <MapPin className="text-primary-foreground w-5 h-5" />
                </div>
                <span className="font-bold text-2xl tracking-tight">Society<span className="text-primary">Bazaar</span></span>
              </div>
              <p className="text-background/70 max-w-sm">The trusted marketplace for your apartment society. Discover, connect, and support home businesses right next door.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection("categories")} className="text-background/70 hover:text-primary transition-colors">Browse Categories</button></li>
                <li><button onClick={() => setLocation("/sell")} className="text-background/70 hover:text-primary transition-colors">List Your Business</button></li>
                <li><button onClick={() => scrollToSection("pricing")} className="text-background/70 hover:text-primary transition-colors">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-background/70 hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-background/70 hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-background/70 hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between text-background/50 text-sm">
            <p>&copy; 2025 Society Bazaar. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Built with care for communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
