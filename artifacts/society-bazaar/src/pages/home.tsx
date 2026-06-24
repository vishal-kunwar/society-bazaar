import { useState } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Search,
  MapPin,
  Utensils,
  Cake,
  BookOpen,
  Dumbbell,
  Scissors,
  Sparkles,
  Wrench,
  MoreHorizontal,
  Star,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
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

  const businesses = [
    {
      name: "Priya's Home Tiffin",
      category: "Food & Tiffin",
      rating: 4.8,
      stats: "120 orders",
      description: "Freshly cooked North Indian meals delivered to your door",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    },
    {
      name: "Sugar Oven Bakery",
      category: "Bakery & Sweets",
      rating: 4.9,
      stats: "85 orders",
      description: "Custom cakes, cookies & muffins for every occasion",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
    },
    {
      name: "BrightMinds Tuition",
      category: "Tuition & Classes",
      rating: 4.7,
      stats: "45 students",
      description: "Maths & Science for Std 5–10, small batches",
      image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
    },
    {
      name: "Serenity Yoga",
      category: "Fitness & Yoga",
      rating: 5.0,
      stats: "30 members",
      description: "Morning yoga sessions on the society terrace",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    },
    {
      name: "Meera Tailoring",
      category: "Tailoring",
      rating: 4.6,
      stats: "200+ clients",
      description: "Blouses, alterations & custom stitching",
      image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
    },
    {
      name: "Glow Beauty Studio",
      category: "Beauty & Wellness",
      rating: 4.9,
      stats: "60 clients",
      description: "Bridal makeup, facials & threading at home",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    },
  ];

  const testimonials = [
    {
      name: "Ramesh K.",
      location: "B-Wing",
      text: "I used to struggle finding a reliable tiffin service. Found Priya's kitchen through the Bazaar and it's been a lifesaver. The food feels just like home.",
    },
    {
      name: "Anita Shah",
      location: "Tower 2",
      text: "Such a brilliant initiative! I started offering my baking services here and got 20 orders in the first week from my own society.",
    },
    {
      name: "Kiran Mehta",
      location: "C-Block",
      text: "Booked a yoga instructor for the morning terrace sessions. It's so convenient to have trusted professionals right in our own complex.",
    },
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

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("home")} data-testid="link-home" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</button>
            <button onClick={() => scrollToSection("categories")} data-testid="link-categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Categories</button>
            <button onClick={() => scrollToSection("sellers")} data-testid="link-sellers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sellers</button>
            <button onClick={() => scrollToSection("pricing")} data-testid="link-pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="default" className="font-semibold shadow-sm hover-elevate">
              List Your Business
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border/40 shadow-lg py-4 px-4 flex flex-col gap-4">
            <button onClick={() => scrollToSection("home")} className="text-left text-sm font-medium text-foreground py-2 border-b border-border/40">Home</button>
            <button onClick={() => scrollToSection("categories")} className="text-left text-sm font-medium text-foreground py-2 border-b border-border/40">Categories</button>
            <button onClick={() => scrollToSection("sellers")} className="text-left text-sm font-medium text-foreground py-2 border-b border-border/40">Sellers</button>
            <button onClick={() => scrollToSection("pricing")} className="text-left text-sm font-medium text-foreground py-2 border-b border-border/40">Pricing</button>
            <Button className="w-full mt-2">List Your Business</Button>
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="secondary" className="mb-6 px-4 py-1.5 rounded-full text-primary bg-primary/10 border-primary/20 font-medium text-sm">
                  <ShieldCheck className="w-4 h-4 mr-2 inline-block" />
                  Trusted by 500+ Societies
                </Badge>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
                  Discover the best <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">home businesses</span> in your society.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                  From fresh home-cooked meals to expert tutors and talented tailors.
                  Connect directly with your neighbours, support local, and build trust.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="w-full sm:w-auto text-base h-14 px-8 shadow-md hover-elevate group" onClick={() => scrollToSection("sellers")}>
                    Explore Businesses
                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-14 px-8 border-primary/20 text-foreground hover:bg-primary/5 hover-elevate">
                    List My Business
                  </Button>
                </div>
              </motion.div>

              {/* Search Bar Container */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-16 bg-background rounded-2xl p-2 md:p-3 shadow-xl border border-border/60 max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-3"
              >
                <div className="flex items-center flex-1 w-full px-3 md:border-r border-border">
                  <MapPin className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
                  <Select defaultValue="sunshine">
                    <SelectTrigger className="border-0 shadow-none focus:ring-0 px-0 font-medium h-12 w-full text-base bg-transparent">
                      <SelectValue placeholder="Select Society" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunshine">Sunshine Residency</SelectItem>
                      <SelectItem value="orchid">Orchid Petals</SelectItem>
                      <SelectItem value="royal">Royal Enclave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center flex-2 w-full px-3">
                  <Search className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
                  <Input
                    type="text"
                    placeholder="Search for tiffin, tutors, tailors..."
                    className="border-0 shadow-none focus-visible:ring-0 px-0 h-12 w-full text-base bg-transparent placeholder:text-muted-foreground/70"
                  />
                </div>
                <Button size="lg" className="w-full md:w-auto h-12 rounded-xl px-8 shadow-sm">
                  Search
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="py-20 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-3">What are you looking for?</h2>
              <p className="text-muted-foreground">Browse through categories to find exactly what you need.</p>
            </div>
            <div className="flex overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 lg:grid-cols-8 gap-4 snap-x hide-scrollbar">
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

        {/* Featured Businesses Section */}
        <section id="sellers" className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Businesses in Your Society</h2>
                <p className="text-lg text-muted-foreground max-w-2xl">Discover trusted neighbours offering their services. Support local, build connections.</p>
              </div>
              <Button variant="outline" className="hidden md:flex">View All</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businesses.map((biz, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                >
                  <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 group hover-elevate">
                    <div className="h-48 overflow-hidden relative">
                      <img src={biz.image} alt={biz.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-background/90 text-foreground backdrop-blur-sm hover:bg-background/90 border-0 font-medium">
                          {biz.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-xl text-foreground line-clamp-1">{biz.name}</h3>
                        <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-md">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          <span className="text-sm font-bold text-foreground">{biz.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{biz.description}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                        <span className="text-sm font-medium text-muted-foreground flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1.5 text-primary" />
                          {biz.stats}
                        </span>
                        <a 
                          href="https://wa.me/919999999999" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow-sm hover-elevate h-9 px-4 py-2 bg-[#25D366] text-white hover:bg-[#20bd5a]"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 text-center md:hidden">
              <Button variant="outline" className="w-full">View All Businesses</Button>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="py-24 bg-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">Manage your business, your way.</h2>
                <p className="text-primary-foreground/80 text-lg md:text-xl max-w-xl mx-auto lg:mx-0">
                  Get a dedicated storefront link, track inquiries, and manage your products easily from your phone. No technical skills required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto font-bold text-primary hover-elevate">
                    Create Store Now
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    See How It Works
                  </Button>
                </div>
              </div>
              
              <div className="lg:w-1/2 w-full">
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-background rounded-2xl shadow-2xl p-6 border border-border/20 max-w-md mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500"
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-xl">S</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Sugar Oven Bakery</h4>
                        <p className="text-xs text-muted-foreground">Store Active • societybazaar.com/sugaroven</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-muted p-4 rounded-xl">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Inquiries this week</p>
                      <p className="text-2xl font-bold text-foreground">12</p>
                    </div>
                    <div className="bg-muted p-4 rounded-xl">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Rating</p>
                      <div className="flex items-center">
                        <p className="text-2xl font-bold text-foreground mr-2">4.9</p>
                        <Star className="w-4 h-4 fill-accent text-accent" />
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 mb-3" variant="ghost">
                    Add New Product
                  </Button>
                  <Button className="w-full" variant="outline">
                    View My Storefront
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Simple, honest pricing.</h2>
              <p className="text-lg text-muted-foreground">Start for free, upgrade when you grow. No hidden fees.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <Card className="relative overflow-hidden border-border/50 shadow-md hover:shadow-xl transition-shadow bg-background">
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                  MOST POPULAR
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Free Start</h3>
                  <div className="flex items-baseline mb-6">
                    <span className="text-5xl font-extrabold text-foreground">₹0</span>
                    <span className="text-muted-foreground ml-2">/ first 6 months</span>
                  </div>
                  <p className="text-muted-foreground mb-8 pb-8 border-b border-border/50">Perfect for getting started and testing the waters in your society.</p>
                  
                  <ul className="space-y-4 mb-8">
                    {['List unlimited products', 'Direct WhatsApp inquiries', 'Basic storefront profile', 'Community visibility'].map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-primary mr-3 shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button size="lg" className="w-full hover-elevate">Start Free Now</Button>
                  <p className="text-xs text-center text-muted-foreground mt-4">No credit card needed</p>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="border-border/50 shadow-sm bg-background/50 relative">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Growth Plan</h3>
                  <div className="flex items-baseline mb-6">
                    <span className="text-5xl font-extrabold text-foreground">₹199</span>
                    <span className="text-muted-foreground ml-2">/ month</span>
                  </div>
                  <p className="text-muted-foreground mb-8 pb-8 border-b border-border/50">For established businesses looking to expand their reach.</p>
                  
                  <ul className="space-y-4 mb-8">
                    {['Everything in Free, plus:', 'Priority listing in search', 'Analytics & visitor insights', 'Verified seller badge', 'Featured homepage placement'].map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-muted-foreground mr-3 shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
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
              {testimonials.map((testimonial, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="bg-muted/40 p-8 rounded-2xl border border-border/50 relative"
                >
                  <div className="text-primary text-6xl font-serif absolute top-4 left-6 opacity-20">"</div>
                  <p className="text-foreground mb-6 relative z-10 italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
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
                <span className="font-bold text-2xl tracking-tight">
                  Society<span className="text-primary">Bazaar</span>
                </span>
              </div>
              <p className="text-background/70 max-w-sm">
                The trusted marketplace for your apartment society. Discover, connect, and support home businesses right next door.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-background/70 hover:text-primary transition-colors">Browse Categories</a></li>
                <li><a href="#" className="text-background/70 hover:text-primary transition-colors">List Your Business</a></li>
                <li><a href="#" className="text-background/70 hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="text-background/70 hover:text-primary transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-background/70 hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-background/70 hover:text-primary transition-colors">Safety & Trust</a></li>
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
