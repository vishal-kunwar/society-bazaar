import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import {
  MapPin, ArrowLeft, Star, ShieldCheck, MessageCircle, Phone, AlertTriangle,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_IMAGES: Record<string, string> = {
  "Food & Tiffin": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80",
  "Bakery & Sweets": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&q=80",
  "Tuition & Classes": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=80",
  "Fitness & Yoga": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80",
  "Tailoring": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&q=80",
  "Beauty & Wellness": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80",
  "Home Services": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80",
  "Others": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
};

export default function BusinessDetail() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  const businessId = Number(params.id);

  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["business", businessId],
    queryFn: () => api.businesses.get(businessId),
    enabled: !isNaN(businessId),
  });

  const submitReview = useMutation({
    mutationFn: () =>
      api.reviews.create({
        businessId,
        reviewerName: reviewName || user?.firstName || "Anonymous",
        rating: reviewRating,
        comment: reviewComment,
      }),
    onSuccess: () => {
      setReviewSubmitted(true);
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-4">Business not found</h1>
        <Button onClick={() => setLocation("/")}>Return Home</Button>
      </div>
    );
  }

  const { business: biz, society, avgRating, reviewCount, leadCount, reviews = [] } = data;
  const imgUrl = biz.imageUrl || CATEGORY_IMAGES[biz.category] || CATEGORY_IMAGES["Others"];

  const handleWhatsApp = () => {
    api.leads.track(biz.id, "whatsapp").catch(() => {});
    const msg = encodeURIComponent(
      "Hi, I found your business on Society Bazaar and would like to know more."
    );
    window.open(`https://wa.me/${biz.whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-24">
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              Society<span className="text-primary">Bazaar</span>
            </span>
          </div>
          <Button variant="outline" className="font-semibold shadow-sm" onClick={() => setLocation("/sell")}>
            List Your Business
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-6 pt-8 mb-6">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Listings
        </button>
      </div>

      <div className="w-full max-h-96 overflow-hidden">
        <img src={imgUrl} alt={biz.businessName} className="w-full h-80 md:h-96 object-cover" />
      </div>

      <div className="container mx-auto px-4 md:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-3xl font-extrabold text-foreground">{biz.businessName}</h1>
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Resident
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary">{biz.category}</Badge>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star
                        key={n}
                        className={`w-4 h-4 ${n <= Math.round(Number(avgRating)) ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                      />
                    ))}
                    <span className="text-sm font-semibold text-foreground ml-1">
                      {Number(avgRating).toFixed(1) !== "0.0" ? Number(avgRating).toFixed(1) : "No ratings"}
                    </span>
                    <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-sm">
              <div>
                <p className="text-muted-foreground text-xs font-medium mb-1">Owner</p>
                <p className="font-semibold text-foreground">{biz.ownerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium mb-1">Society</p>
                <p className="font-semibold text-foreground">{society?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium mb-1">Total Leads</p>
                <p className="font-semibold text-foreground">{leadCount}</p>
              </div>
            </div>

            <p className="text-foreground/80 leading-relaxed mb-8">{biz.description}</p>

            {/* Customer Reviews */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-foreground mb-6">Customer Reviews</h2>
              {reviews.length === 0 && (
                <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review!</p>
              )}
              <div className="space-y-5">
                {reviews.map((review) => (
                  <div key={review.id} className="p-5 rounded-xl border border-border/50 bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {review.reviewerName.charAt(0)}
                        </div>
                        <span className="font-semibold text-foreground">{review.reviewerName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} className={`w-4 h-4 ${n <= review.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-foreground/80 text-sm">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave a Review */}
            {isLoaded && user && !reviewSubmitted && (
              <div className="mb-10">
                <h3 className="text-lg font-bold text-foreground mb-4">Leave a Review</h3>
                <Card className="border-border/50">
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Your Name</label>
                      <Input
                        value={reviewName || user.firstName || ""}
                        onChange={e => setReviewName(e.target.value)}
                        placeholder="Your name"
                        data-testid="input-review-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setReviewRating(n)}
                            data-testid={`button-star-${n}`}
                          >
                            <Star className={`w-6 h-6 ${n <= reviewRating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Review</label>
                      <Textarea
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        placeholder="Share your experience..."
                        className="min-h-[100px] resize-none"
                        data-testid="input-review-comment"
                      />
                    </div>
                    <Button
                      onClick={() => submitReview.mutate()}
                      disabled={submitReview.isPending || !reviewComment}
                      className="w-full"
                      data-testid="button-submit-review"
                    >
                      {submitReview.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
            {reviewSubmitted && (
              <div className="mb-10 p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm font-medium">
                Thank you for your review!
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="border-border/50 shadow-md">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-foreground">
                      {Number(avgRating).toFixed(1) !== "0.0" ? Number(avgRating).toFixed(1) : "—"}
                    </div>
                    <div className="flex justify-center gap-1 my-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} className={`w-4 h-4 ${n <= Math.round(Number(avgRating)) ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{reviewCount} reviews</p>
                  </div>

                  <button
                    className="w-full inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors h-12 px-6 bg-[#25D366] text-white hover:bg-[#20bd5a]"
                    onClick={handleWhatsApp}
                    data-testid="button-whatsapp-contact"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat on WhatsApp
                  </button>

                  <a
                    href={`tel:${biz.phone}`}
                    className="w-full inline-flex items-center justify-center rounded-md text-sm font-semibold border border-border hover:bg-muted transition-colors h-12 px-6 text-foreground"
                    data-testid="button-call"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call Owner
                  </a>

                  <button className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1 pt-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Report this listing
                  </button>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-5">
                  <h4 className="font-semibold text-foreground mb-3">Business Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium text-foreground">{biz.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Society</span>
                      <span className="font-medium text-foreground">{society?.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Leads</span>
                      <span className="font-medium text-foreground">{leadCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
