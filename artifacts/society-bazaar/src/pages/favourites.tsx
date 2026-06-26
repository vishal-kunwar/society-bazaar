import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useClerk, UserButton } from "@clerk/react";
import { motion } from "framer-motion";
import { MapPin, Heart, Star, TrendingUp, MessageCircle, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

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

export default function Favourites() {
  const [, setLocation] = useLocation();
  const { signOut } = useClerk();
  const qc = useQueryClient();

  const { data: favs, isLoading } = useQuery({
    queryKey: ["favourites"],
    queryFn: () => api.favourites.list(),
  });

  const toggle = useMutation({
    mutationFn: (businessId: number) => api.favourites.toggle(businessId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favourites"] });
      qc.invalidateQueries({ queryKey: ["favourite-ids"] });
    },
  });

  const handleWhatsApp = (businessId: number, whatsapp: string) => {
    api.leads.track(businessId, "whatsapp").catch(() => {});
    const msg = encodeURIComponent("Hi, I found your business on Hustly and would like to know more.");
    window.open(`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Hust<span className="text-primary">ly</span>
            </span>
          </div>
          <div className="flex items-center gap-2 border-l border-border/40 pl-2 ml-1">
            <Button variant="outline" size="sm" onClick={() => signOut({ redirectUrl: basePath || "/" })}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
            <div className="h-8 w-8 flex items-center justify-center">
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 md:px-6 py-10 max-w-5xl">
        <button onClick={() => setLocation("/")} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Favourites</h1>
            <p className="text-sm text-muted-foreground">Businesses you've saved</p>
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}
          </div>
        )}

        {!isLoading && !favs?.length && (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="font-semibold text-lg text-foreground mb-2">No favourites yet</h3>
            <p className="text-muted-foreground mb-6">Browse businesses and tap the heart to save them here.</p>
            <Button onClick={() => setLocation("/")}>Explore Businesses</Button>
          </div>
        )}

        {!isLoading && favs && favs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favs.map((row, idx) => {
              const biz = row.business;
              const imgUrl = biz.imageUrl || CATEGORY_IMAGES[biz.category] || CATEGORY_IMAGES["Others"];
              return (
                <motion.div
                  key={biz.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                >
                  <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="relative h-40 overflow-hidden">
                      <img src={imgUrl} alt={biz.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <button
                        onClick={() => toggle.mutate(biz.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow"
                        disabled={toggle.isPending}
                      >
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-foreground mb-1 truncate" onClick={() => setLocation(`/business/${biz.id}`)}>{biz.businessName}</h3>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{row.society?.name ?? "—"}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" />{Number(row.avgRating).toFixed(1)}</span>
                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-primary" />{row.leadCount} leads</span>
                      </div>
                      <button
                        onClick={() => handleWhatsApp(biz.id, biz.whatsapp)}
                        className="w-full inline-flex items-center justify-center rounded-md h-9 text-sm font-semibold bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
