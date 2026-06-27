import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft, Star, MessageCircle, Phone, Heart, RefreshCw, Package } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api, type Product } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";

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


export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [reviewerName, setReviewerName] = useState(user?.fullName ?? "");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["business", id],
    queryFn: () => api.businesses.get(Number(id)),
  });

  const { data: products } = useQuery({
    queryKey: ["products", id],
    queryFn: () => api.products.list(Number(id)),
    enabled: !!id,
  });

  const { data: favIds } = useQuery({
    queryKey: ["favourite-ids"],
    queryFn: () => api.favourites.ids(),
    enabled: !!user,
  });

  const toggleFav = useMutation({
    mutationFn: (bId: number) => api.favourites.toggle(bId),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["favourite-ids"] });
      qc.invalidateQueries({ queryKey: ["favourites"] });
      toast({ title: result.saved ? "Saved to favourites" : "Removed from favourites" });
    },
  });

  const submitReview = useMutation({
    mutationFn: () =>
      api.reviews.create({ businessId: Number(id), reviewerName, rating, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", id] });
      setComment(""); setShowReviewForm(false);
      toast({ title: "Review submitted! Thanks for helping the community." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleWhatsApp = (source = "whatsapp", product?: Product | null) => {
    if (!data) return;
    const item = product ?? selectedProduct;
    api.leads.track(data.business.id, source).catch(() => {});
    let text = "Hi, I found your business on Hustly and would like to know more.";
    if (item) {
      const pricePart = item.price ? ` (${item.price})` : "";
      text = `Hi, I found your business on Hustly. I'm interested in: ${item.name}${pricePart}.`;
    }
    const msg = encodeURIComponent(text);
    window.open(`https://wa.me/${data.business.whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
    if (source !== "repeat") {
      setTimeout(() => {
        toast({
          title: "Had a good experience?",
          description: "Leave a review to help your neighbours discover this hustle!",
          duration: 9000,
        });
        setTimeout(() => setShowReviewForm(true), 500);
      }, 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Business not found.</p>
          <Button onClick={() => setLocation("/")} variant="outline">Go Home</Button>
        </div>
      </div>
    );
  }

  const { business: biz, society, avgRating, reviewCount, leadCount, reviews, trialExpired } = data;
  const imgUrl = biz.imageUrl || CATEGORY_IMAGES[biz.category] || CATEGORY_IMAGES["Others"];
  const isFav = favIds?.includes(biz.id) ?? false;
  const isNew = Date.now() - new Date(biz.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar
        rightContent={
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        }
      />

      <main className="container mx-auto px-4 md:px-6 py-8 pb-28 lg:pb-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              {/* Hero image */}
              <div className="relative rounded-2xl overflow-hidden aspect-video mb-6 bg-muted">
                <img src={imgUrl} alt={biz.businessName} className="w-full h-full object-cover" />
                {isNew && (
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    ✨ New
                  </span>
                )}
                {user && (
                  <button
                    onClick={() => toggleFav.mutate(biz.id)}
                    disabled={toggleFav.isPending}
                    className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      isFav ? "bg-red-500" : "bg-white/90 hover:bg-white"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFav ? "text-white fill-white" : "text-gray-500"}`} />
                  </button>
                )}
              </div>

              {/* Title row */}
              <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold">{biz.businessName}</h1>
                    <Badge variant="secondary" className="text-xs">{biz.category}</Badge>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    {society?.name}{society?.locality ? `, ${society.locality}` : ""}{society?.city ? `, ${society.city}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {Number(avgRating).toFixed(1)} ({reviewCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    {leadCount} contacts
                  </span>
                </div>
              </div>

              {/* About */}
              <Card className="mb-6 border-border/50">
                <CardContent className="p-5">
                  <h2 className="font-semibold mb-3">About this hustle</h2>
                  <p className="text-muted-foreground leading-relaxed">{biz.description}</p>
                </CardContent>
              </Card>

              {/* Products & Services */}
              {products && products.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold">Products & Services</h2>
                    <span className="text-sm text-muted-foreground">({products.length})</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Tap a product to select it — your WhatsApp message will include your choice.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map(product => {
                      const isSelected = selectedProduct?.id === product.id;
                      return (
                        <Card
                          key={product.id}
                          onClick={() => setSelectedProduct(isSelected ? null : product)}
                          className={`overflow-hidden border-border/50 cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? "ring-2 ring-primary border-primary/50 shadow-md" : ""
                          }`}
                        >
                          <div className="relative h-36 bg-muted overflow-hidden">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <Package className="w-8 h-8 text-muted-foreground/40" />
                              </div>
                            )}
                            {product.featured && (
                              <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-yellow-900" />Featured
                              </span>
                            )}
                            {isSelected && (
                              <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Selected
                              </span>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-bold text-sm leading-tight">{product.name}</h3>
                              {product.price && (
                                <span className="text-sm font-bold text-primary shrink-0">{product.price}</span>
                              )}
                            </div>
                            {product.category && (
                              <Badge variant="secondary" className="text-[10px] mb-2">{product.category}</Badge>
                            )}
                            {product.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                            )}
                            {trialExpired ? (
                              <button
                                disabled
                                className="mt-3 w-full inline-flex items-center justify-center rounded-lg h-8 text-xs font-semibold bg-muted text-muted-foreground cursor-not-allowed"
                              >
                                <Phone className="w-3.5 h-3.5 mr-1" /> Unavailable
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(product);
                                  handleWhatsApp("whatsapp", product);
                                }}
                                className="mt-3 w-full inline-flex items-center justify-center rounded-lg h-8 text-xs font-semibold bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5 mr-1" /> Enquire on WhatsApp
                              </button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {reviews && reviews.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold mb-4">Reviews ({reviews.length})</h2>
                  <div className="space-y-3">
                    {reviews.map(rv => (
                      <Card key={rv.id} className="border-border/40">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-sm">{rv.reviewerName}</p>
                            <div className="flex">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3.5 h-3.5 ${s <= rv.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{rv.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Review form */}
              {showReviewForm && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="p-5">
                      <h3 className="font-bold mb-4">Leave a Review</h3>
                      <div className="space-y-3">
                        <Input
                          placeholder="Your name"
                          value={reviewerName}
                          onChange={e => setReviewerName(e.target.value)}
                        />
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(s => (
                            <button key={s} type="button" onClick={() => setRating(s)}>
                              <Star className={`w-7 h-7 ${s <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                            </button>
                          ))}
                        </div>
                        <Textarea
                          placeholder="Share your experience…"
                          className="resize-none"
                          rows={3}
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                        />
                        <div className="flex gap-3">
                          <Button
                            onClick={() => submitReview.mutate()}
                            disabled={!reviewerName || !comment || submitReview.isPending}
                          >
                            {submitReview.isPending ? "Submitting…" : "Submit Review"}
                          </Button>
                          <Button variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* WhatsApp CTA Desktop */}
              <div className="hidden lg:block">
                <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-7 h-7 text-[#25D366]" />
                  </div>
                  <h3 className="font-bold text-center mb-1">{biz.businessName}</h3>
                  <p className="text-xs text-muted-foreground text-center mb-2">Tap to start a conversation on WhatsApp</p>
                  {selectedProduct && (
                    <p className="text-xs text-center mb-3 px-2 py-1.5 rounded-lg bg-primary/10 text-primary font-medium">
                      Selected: {selectedProduct.name}
                    </p>
                  )}
                  {trialExpired ? (
                    <div className="relative group w-full">
                      <button
                        disabled
                        className="w-full inline-flex items-center justify-center rounded-xl h-12 text-base font-bold bg-muted text-muted-foreground cursor-not-allowed shadow"
                      >
                        <Phone className="w-5 h-5 mr-2" /> Seller Unavailable
                      </button>
                      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs rounded-md py-1 px-2 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 text-center pointer-events-none z-10 shadow-md">
                        This seller's subscription has expired. Contact will be available once the seller renews their plan.
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleWhatsApp()}
                      className="w-full inline-flex items-center justify-center rounded-xl h-12 text-base font-bold bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors shadow"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp Now
                    </button>
                  )}
                  {user && (
                    <button
                      onClick={() => handleWhatsApp("repeat")}
                      className="mt-3 w-full inline-flex items-center justify-center rounded-xl h-10 text-sm font-semibold border border-border hover:bg-muted transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" /> Order Again
                    </button>
                  )}
                </CardContent>
              </Card>
              </div>

              {/* Favourite toggle */}
              {user && (
                <button
                  onClick={() => toggleFav.mutate(biz.id)}
                  disabled={toggleFav.isPending}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl h-10 text-sm font-semibold border-2 transition-all ${
                    isFav
                      ? "border-red-400 bg-red-50 text-red-600"
                      : "border-border hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
                  {isFav ? "Saved to Favourites" : "Save to Favourites"}
                </button>
              )}

              {/* Write review trigger */}
              {!showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl h-10 text-sm font-medium border border-border hover:bg-muted transition-colors"
                >
                  <Star className="w-4 h-4 text-yellow-500" /> Write a Review
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Floating CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border/40 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-40">
        <div className="max-w-md mx-auto">
          {selectedProduct && (
            <p className="text-xs text-center mb-2 px-2 py-1 rounded-md bg-primary/10 text-primary font-medium line-clamp-1">
              Selected: {selectedProduct.name}
            </p>
          )}
          {trialExpired ? (
            <button
              disabled
              className="w-full inline-flex items-center justify-center rounded-xl h-12 text-base font-bold bg-muted text-muted-foreground cursor-not-allowed shadow"
            >
              <Phone className="w-5 h-5 mr-2" /> Seller Unavailable
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleWhatsApp()}
                className="flex-1 inline-flex items-center justify-center rounded-xl h-12 text-base font-bold bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors shadow"
              >
                <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp Now
              </button>
              {user && (
                <button
                  onClick={() => handleWhatsApp("repeat")}
                  className="shrink-0 w-12 h-12 inline-flex items-center justify-center rounded-xl border border-border bg-background hover:bg-muted transition-colors shadow-sm"
                  title="Order Again"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
