import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  MapPin, Star, CheckCircle2, ShieldCheck,
  Zap, Users, ChevronDown, ArrowRight
} from "lucide-react";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FAQ_ITEMS = [
  {
    q: "How does Hustly work?",
    a: "Hustly is a hyper-local marketplace for your society. You list your home business, menu, or services, and residents in your society can discover you and message you directly on WhatsApp to place orders."
  },
  {
    q: "Is it really free to list?",
    a: "Yes! Your first 25 WhatsApp leads are completely free, OR you get 90 days free — whichever comes first. No credit card required."
  },
  {
    q: "How do deliveries work?",
    a: "Since you are selling to your own neighbours in the same society, buyers can easily pick up their orders from your flat, or you can drop them off. No need for complex shipping or delivery partners!"
  },
  {
    q: "What can I list on Hustly?",
    a: "You can list any home business, including food & tiffins, bakery & sweets, home tuition, fitness/yoga classes, tailoring, beauty services, home repairs, or custom crafts."
  }
];

export default function SellerLanding() {
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { isSignedIn } = useUser();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Signed-in sellers go straight to dashboard; signed-out go to sign-in with redirect back to dashboard
  const handleSellerCTA = () => {
    if (isSignedIn) {
      setLocation("/dashboard");
    } else {
      setLocation("/sign-in");
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">Hust<span className="text-primary">ly</span></span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold ml-1">Sellers</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>Explore Marketplace</Button>
            <Button size="sm" onClick={handleSellerCTA}>
              {isSignedIn ? "My Dashboard" : "Start Your Hustle"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background pt-20 pb-28 border-b border-border/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-primary/20">
              <Zap className="w-3.5 h-3.5" /> First 25 WhatsApp leads free — no setup fees
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-5">
              Grow your home business<br />
              <span className="text-primary">in your own society.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Connect directly with neighbours who want your delicious home-cooked meals, baked goods, classes, and home services.
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="font-bold text-base px-8 h-13 shadow-lg shadow-primary/20 flex items-center gap-2"
                onClick={handleSellerCTA}
              >
                {isSignedIn ? "Go to My Dashboard" : "List Your Business — It's Free"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits / Why Hustly */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-14">Why sellers love Hustly</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Live in Minutes", body: "List your business and start getting WhatsApp leads the same day. No setup fees, no tech skills needed." },
              { icon: Users, title: "Hyper-Local Reach", body: "Your listing appears to people in your own society and neighbourhood — buyers who are just steps away." },
              { icon: ShieldCheck, title: "Free to Start", body: "First 25 WhatsApp leads are completely free OR 90 days free, whichever comes first. After that, just ₹199/month." },
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

      {/* Pricing */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">Simple, honest pricing</h2>
          <p className="text-center text-muted-foreground mb-12">Start free. Scale with your hustle.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 border-primary/30 bg-primary/5 shadow-lg">
              <CardContent className="p-8">
                <div className="inline-block bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4">Founding Seller — Free</div>
                <div className="text-4xl font-extrabold mb-1">₹0</div>
                <p className="text-sm text-muted-foreground mb-6">First 25 WhatsApp leads OR 90 days, whichever comes first</p>
                <ul className="space-y-2.5 mb-8">
                  {["25 free WhatsApp leads", "90-day free trial", "Business listing page", "Society Feed posts", "Daily Deals", "Review collection"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full font-bold" onClick={handleSellerCTA}>
                  <Zap className="w-4 h-4 mr-2" />{isSignedIn ? "Go to Dashboard" : "Start Free"}
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
                <Button variant="outline" className="w-full font-bold" disabled>Coming Soon</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
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

      {/* FAQ */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h2 className="text-3xl font-extrabold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-border/60 rounded-xl overflow-hidden bg-background">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold hover:bg-muted/10 transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 border-t border-border/40 text-sm text-muted-foreground leading-relaxed bg-muted/5">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA to Sign Up */}
      <section className="py-20 bg-primary text-primary-foreground border-t border-border/30">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Start Selling Today</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join other home businesses in your society. List your services and menu items in minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="font-bold text-base px-8"
              onClick={handleSellerCTA}
            >
              {isSignedIn ? "Go to My Dashboard" : "List Your Business Now"}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background py-12">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl">Hust<span className="text-primary">ly</span></span>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            © {new Date().getFullYear()} Hustly. Your neighbourhood marketplace.
          </p>
        </div>
      </footer>
    </div>
  );
}
