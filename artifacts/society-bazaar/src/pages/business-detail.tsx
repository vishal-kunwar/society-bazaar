import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import {
  MapPin,
  ArrowLeft,
  Star,
  ShieldCheck,
  MessageCircle,
  Phone,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { businesses } from "@/data/businesses";

export default function BusinessDetail() {
  const [, setLocation] = useLocation();
  const params = useParams();
  
  const businessId = params.id ? parseInt(params.id, 10) : -1;
  const business = businesses.find(b => b.id === businessId);

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-4">Business not found</h1>
        <Button onClick={() => setLocation("/")}>Return Home</Button>
      </div>
    );
  }

  const trackLead = (businessName: string) => {
    const key = `lead_count_${businessName}`;
    const current = parseInt(localStorage.getItem(key) || "0", 10);
    localStorage.setItem(key, (current + 1).toString());
  };

  const relatedBusinesses = businesses.filter(b => b.id !== business.id).slice(0, 2);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary pb-24">
      {/* Navbar */}
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

          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" className="font-semibold shadow-sm" onClick={() => setLocation("/sell")}>
              List Your Business
            </Button>
          </div>
        </div>
      </nav>

      <main>
        {/* Cover Image */}
        <div className="w-full h-64 md:h-96 relative bg-muted">
          <img 
            src={business.image} 
            alt={business.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-6 -mt-16 relative z-10">
          <button 
            onClick={() => setLocation("/")} 
            className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors bg-background/80 backdrop-blur-md px-4 py-2 rounded-full mb-6 w-fit shadow-sm border border-border"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Listings
          </button>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Content */}
            <div className="lg:w-2/3">
              <div className="bg-background rounded-2xl p-6 md:p-8 shadow-sm border border-border/50 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground">{business.name}</h1>
                      {business.verified && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Verified Resident
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-muted-foreground border-border/60">
                      {business.category}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-border/40 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Star className="w-5 h-5 fill-accent text-accent mr-2" />
                    <span className="font-bold text-foreground mr-1">{business.rating}</span> 
                    ({business.reviews.length} reviews)
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mr-3">
                      {business.owner.charAt(0)}
                    </span>
                    <div>
                      <p className="text-foreground font-medium">{business.owner}</p>
                      <p className="text-xs">Owner</p>
                    </div>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-5 h-5 mr-2 text-primary/70" />
                    <div>
                      <p className="text-foreground font-medium">{business.society}</p>
                      <p className="text-xs">Location</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4">About this business</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {business.description}
                  </p>
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6">Customer Reviews</h3>
                <div className="space-y-4">
                  {business.reviews.map((review, idx) => (
                    <Card key={idx} className="border-border/50 shadow-sm bg-background">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                              {review.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{review.name}</p>
                              <p className="text-xs text-muted-foreground">{review.date}</p>
                            </div>
                          </div>
                          <div className="flex text-accent">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-accent' : 'text-border'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.text}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:w-1/3">
              <div className="sticky top-24 space-y-6">
                <Card className="border-primary/20 shadow-md bg-background">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-6">Contact {business.owner.split(' ')[0]}</h3>
                    
                    <div className="space-y-3">
                      <a 
                        href={`https://wa.me/919999999999?text=Hi%2C%20I%20found%20your%20business%20on%20Society%20Bazaar%20and%20would%20like%20to%20know%20more.`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => trackLead(business.name)}
                        className="flex w-full items-center justify-center rounded-md text-base font-bold transition-colors shadow-sm h-12 px-4 py-2 bg-[#25D366] text-white hover:bg-[#20bd5a] hover-elevate"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Chat on WhatsApp
                      </a>
                      
                      <a 
                        href="tel:+919999999999"
                        className="flex w-full items-center justify-center rounded-md text-base font-bold transition-colors border border-border bg-background text-foreground hover:bg-muted/50 h-12 px-4 py-2"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Call Owner
                      </a>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/50 text-center">
                      <div className="inline-flex items-center justify-center p-3 rounded-full bg-accent/10 mb-2">
                        <Star className="w-6 h-6 fill-accent text-accent" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{business.rating} <span className="text-sm text-muted-foreground font-normal">/ 5.0</span></p>
                      <p className="text-sm text-muted-foreground">Based on {business.reviews.length} reviews</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <button className="text-xs text-muted-foreground flex items-center justify-center w-full hover:text-foreground transition-colors">
                    <AlertTriangle className="w-3 h-3 mr-1.5" /> Report this listing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Businesses */}
        <div className="container mx-auto px-4 md:px-6 mt-24">
          <h3 className="text-2xl font-bold text-foreground mb-8">More from your society</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedBusinesses.map((biz, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                key={idx}
                className="cursor-pointer"
                onClick={() => {
                  window.scrollTo(0,0);
                  setLocation(`/business/${biz.id}`);
                }}
              >
                <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 group hover-elevate h-full flex flex-col">
                  <div className="h-40 overflow-hidden relative shrink-0">
                    <img src={biz.image} alt={biz.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-background/90 text-foreground backdrop-blur-sm hover:bg-background/90 border-0 font-medium">
                        {biz.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5 flex flex-col grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">{biz.name}</h3>
                      <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-md shrink-0">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        <span className="text-xs font-bold text-foreground">{biz.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{biz.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
