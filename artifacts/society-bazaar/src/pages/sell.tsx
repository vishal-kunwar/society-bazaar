import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, CheckCircle2, ArrowLeft, ArrowRight, User, Building2,
  Phone, Image as ImageIcon, Tag, Eye, Zap, Star, MessageCircle,
  TrendingUp, Flame,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/image-upload";
import { Navbar } from "@/components/navbar";

const CATEGORIES = [
  "Food & Tiffin", "Bakery & Sweets", "Tuition & Classes",
  "Fitness & Yoga", "Tailoring", "Beauty & Wellness", "Home Services", "Others",
];

const PRICE_RANGES = [
  "Under ₹200", "₹200–₹500", "₹500–₹1000", "₹1000–₹2000", "Above ₹2000",
];

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

interface FormData {
  // Step 1 – Personal
  ownerName: string;
  phone: string;
  email: string;
  // Step 2 – Business
  businessName: string;
  category: string;
  description: string;
  yearsInBusiness: string;
  // Step 3 – Location
  societyName: string;
  locality: string;
  tower: string;
  flatNumber: string;
  city: string;
  // Step 4 – Contact
  whatsapp: string;
  alternatePhone: string;
  instagram: string;
  website: string;
  // Step 5 – Images
  imageUrl: string;
  coverImageUrl: string;
  // Step 6 – Pricing
  priceRange: string;
  servicesOffered: string;
}

const EMPTY_FORM: FormData = {
  ownerName: "", phone: "", email: "",
  businessName: "", category: "", description: "", yearsInBusiness: "",
  societyName: "", locality: "", tower: "", flatNumber: "", city: "",
  whatsapp: "", alternatePhone: "", instagram: "", website: "",
  imageUrl: "", coverImageUrl: "",
  priceRange: "", servicesOffered: "",
};

const STEPS = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Business", icon: Building2 },
  { id: 3, label: "Location", icon: MapPin },
  { id: 4, label: "Contact", icon: Phone },
  { id: 5, label: "Images", icon: ImageIcon },
  { id: 6, label: "Pricing", icon: Tag },
  { id: 7, label: "Preview", icon: Eye },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        {STEPS.map((step, i) => {
          const done = current > step.id;
          const active = current === step.id;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs font-bold border-2
                  ${done ? "bg-primary border-primary text-primary-foreground" : active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"}`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-[10px] mt-1 font-medium hidden sm:block ${active ? "text-primary" : done ? "text-primary/70" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${done ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Step {current} of {total}</span>
        <span>{Math.round((current / total) * 100)}% complete</span>
      </div>
      <div className="w-full bg-border/40 rounded-full h-1.5 mt-1">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function FieldGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold text-foreground mb-1.5 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function PreviewCard({ data, society }: { data: FormData; society: string }) {
  const imgUrl = data.imageUrl || data.coverImageUrl || CATEGORY_IMAGES[data.category] || CATEGORY_IMAGES["Others"];

  return (
    <div className="rounded-2xl overflow-hidden border border-border/60 shadow-lg bg-white">
      {/* Cover */}
      <div className="relative h-44 overflow-hidden">
        <img src={imgUrl} alt={data.businessName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">✨ New</span>
        </div>
        {data.imageUrl && (
          <div className="absolute bottom-3 left-3 w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow">
            <img src={data.imageUrl} alt="logo" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 className="font-bold text-lg leading-tight">{data.businessName || "Your Business Name"}</h3>
              {data.category && <Badge variant="secondary" className="text-xs">{data.category}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />{society || "Your Society"}{data.locality ? `, ${data.locality}` : ""}{data.city ? `, ${data.city}` : ""}
            </p>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            <div className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" />New</div>
            <div className="flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3 text-primary" />0 leads</div>
          </div>
        </div>

        {data.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3 leading-relaxed">{data.description}</p>
        )}

        {(data.priceRange || data.servicesOffered) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {data.priceRange && <span className="text-xs bg-muted px-2 py-1 rounded-full font-medium">{data.priceRange}</span>}
            {data.servicesOffered && data.servicesOffered.split(",").slice(0, 3).map((s, i) => (
              <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">{s.trim()}</span>
            ))}
          </div>
        )}

        {data.tower && (
          <p className="text-xs text-muted-foreground mb-3">
            📍 {data.tower}{data.flatNumber ? `, Flat ${data.flatNumber}` : ""}
          </p>
        )}

        <div className="flex gap-2">
          <button className="flex-1 inline-flex items-center justify-center rounded-lg h-9 text-sm font-bold bg-[#25D366] text-white">
            <MessageCircle className="w-4 h-4 mr-1.5" />WhatsApp
          </button>
          {data.instagram && (
            <a href={`https://instagram.com/${data.instagram.replace("@", "")}`} target="_blank" rel="noreferrer"
              className="h-9 px-3 inline-flex items-center justify-center rounded-lg border border-border text-xs font-semibold hover:bg-muted">
              Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Sell() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    ...EMPTY_FORM,
    ownerName: user?.fullName ?? "",
    email: user?.primaryEmailAddress?.emailAddress ?? "",
    phone: user?.primaryPhoneNumber?.phoneNumber ?? "",
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: societies } = useQuery({
    queryKey: ["societies", formData.city, formData.locality],
    queryFn: () => api.societies.list(formData.city || undefined, formData.locality || undefined),
    enabled: !!formData.city && !!formData.locality,
  });

  

  const set = (field: keyof FormData, val: string) =>
    setFormData(prev => ({ ...prev, [field]: val }));

  const createBusiness = useMutation({
    mutationFn: async () => {
      const society = await api.societies.findOrCreate(formData.societyName, formData.city, formData.locality);
      return api.businesses.create({
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        societyId: society.id,
        category: formData.category,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        description: formData.description,
        email: formData.email,
        yearsInBusiness: formData.yearsInBusiness ? Number(formData.yearsInBusiness) : undefined,
        tower: formData.tower,
        flatNumber: formData.flatNumber,
        city: formData.city,
        alternatePhone: formData.alternatePhone,
        instagram: formData.instagram,
        website: formData.website,
        priceRange: formData.priceRange,
        servicesOffered: formData.servicesOffered,
        imageUrl: formData.imageUrl,
        coverImageUrl: formData.coverImageUrl,
      });
    },
    onSuccess: () => setSubmitted(true),
    onError: (e: Error) => toast({ title: "Submission failed", description: e.message, variant: "destructive" }),
  });

  // Per-step validation
  function canProceed(): boolean {
    switch (step) {
      case 1: return !!formData.ownerName.trim() && !!formData.phone.trim() && !!formData.email.trim();
      case 2: return !!formData.businessName.trim() && !!formData.category && !!formData.description.trim();
      case 3: return !!formData.societyName.trim() && !!formData.locality.trim() && !!formData.city.trim();
      case 4: return !!formData.whatsapp.trim();
      case 5: return true; // Images optional
      case 6: return true; // Pricing optional
      case 7: return true;
      default: return true;
    }
  }

  function next() {
    if (!canProceed()) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    if (step < 7) setStep(s => s + 1);
    else createBusiness.mutate();
  }

  const slideVariants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="max-w-lg w-full"
        >
          <Card className="border-primary/30 bg-primary/5 shadow-xl overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">🎉 Congratulations!</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Your <strong>Hustly business profile</strong> has been created.<br />
                Our team will review your listing within 24 hours.<br />
                Once approved, your business will be visible to buyers.
              </p>

              <div className="bg-white rounded-xl p-5 border border-primary/20 mb-6 text-left">
                <p className="font-bold mb-3 text-center text-sm text-primary">Your Founding Seller Offer has started</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium">First 50 leads free</span>
                  </div>
                  <div className="flex items-center gap-2 pl-2">
                    <span className="text-xs text-muted-foreground">OR</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium">First 3 months free</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 pl-8">Whichever comes first.</p>
                </div>
              </div>

              <div className="flex gap-3 flex-col sm:flex-row">
                <Button className="flex-1 font-bold" onClick={() => setLocation("/dashboard")}>
                  <Zap className="w-4 h-4 mr-2" />View Dashboard
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setLocation("/")}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar
        rightContent={
          <button onClick={() => setLocation("/")} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />Back
          </button>
        }
      />

      {/* Header */}
      <div className="bg-gradient-to-b from-primary/8 to-background border-b border-border/30 py-8">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-3 border border-primary/20">
            <Flame className="w-3.5 h-3.5" />First 50 leads free — no credit card needed
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">List Your Hustle</h1>
          <p className="text-muted-foreground text-sm mt-1">Takes less than 3 minutes. We'll review and publish within 24h.</p>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-6 py-10 max-w-2xl">
        <StepIndicator current={step} total={7} />

        <Card className="border-border/50 shadow-md overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {/* ── Step 1: Personal Info ── */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold mb-0.5">Personal Information</h2>
                      <p className="text-sm text-muted-foreground">Tell us about yourself</p>
                    </div>
                    <FieldGroup label="Full Name" required>
                      <Input
                        placeholder="e.g., Priya Sharma"
                        value={formData.ownerName}
                        onChange={e => set("ownerName", e.target.value)}
                      />
                    </FieldGroup>
                    <FieldGroup label="Mobile Number" required>
                      <Input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={e => set("phone", e.target.value)}
                      />
                    </FieldGroup>
                    <FieldGroup label="Email Address" required>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={e => set("email", e.target.value)}
                      />
                    </FieldGroup>
                  </div>
                )}

                {/* ── Step 2: Business Info ── */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold mb-0.5">Business Information</h2>
                      <p className="text-sm text-muted-foreground">Tell us about your hustle</p>
                    </div>
                    <FieldGroup label="Business Name" required>
                      <Input
                        placeholder="e.g., Priya's Home Tiffin"
                        value={formData.businessName}
                        onChange={e => set("businessName", e.target.value)}
                      />
                    </FieldGroup>
                    <FieldGroup label="Category" required>
                      <Select value={formData.category} onValueChange={v => set("category", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FieldGroup>
                    <FieldGroup label="Business Description" required>
                      <Textarea
                        placeholder="Describe what you offer, specialties, timings, minimum order, etc."
                        rows={4}
                        className="resize-none"
                        value={formData.description}
                        onChange={e => set("description", e.target.value)}
                      />
                    </FieldGroup>
                    <FieldGroup label="Years in Business">
                      <Input
                        type="number"
                        min={0}
                        max={50}
                        placeholder="e.g., 3"
                        value={formData.yearsInBusiness}
                        onChange={e => set("yearsInBusiness", e.target.value)}
                      />
                    </FieldGroup>
                  </div>
                )}

                {/* ── Step 3: Location ── */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold mb-0.5">Location</h2>
                      <p className="text-sm text-muted-foreground">Buyers in your area will find you</p>
                    </div>
                    <FieldGroup label="City" required>
                      <Select value={formData.city} onValueChange={v => set("city", v)}>
                        <SelectTrigger><SelectValue placeholder="Select your city" /></SelectTrigger>
                        <SelectContent>
                          {["Delhi", "Gurgaon", "Noida", "Pune", "Mumbai", "Bangalore", "Hyderabad"].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldGroup>
                    <FieldGroup label="Locality / Area" required>
                      <Input
                        placeholder="e.g., Kesnand, Baner, Wakad"
                        value={formData.locality}
                        onChange={e => set("locality", e.target.value)}
                        disabled={!formData.city}
                      />
                    </FieldGroup>
                    <FieldGroup label="Society Name" required>
                      <div className="relative">
                        <Input
                          id="society-name-input"
                          list="society-suggestions"
                          placeholder={formData.locality ? "Type your society name" : "Please select a locality first"}
                          value={formData.societyName}
                          onChange={e => set("societyName", e.target.value)}
                          autoComplete="off"
                          disabled={!formData.locality}
                        />
                        <datalist id="society-suggestions">
                          {societies?.map(s => (
                            <option key={s.id} value={s.name} />
                          ))}
                        </datalist>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Type any name — existing societies in {formData.locality || "your area"} will appear as suggestions</p>
                    </FieldGroup>
                    <FieldGroup label="Tower / Wing">
                      <Input
                        placeholder="e.g., Tower B, Wing A"
                        value={formData.tower}
                        onChange={e => set("tower", e.target.value)}
                      />
                    </FieldGroup>
                    <FieldGroup label="Flat Number (Optional)">
                      <Input
                        placeholder="e.g., B-304"
                        value={formData.flatNumber}
                        onChange={e => set("flatNumber", e.target.value)}
                      />
                    </FieldGroup>
                  </div>
                )}

                {/* ── Step 4: Contact ── */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold mb-0.5">Business Contact</h2>
                      <p className="text-sm text-muted-foreground">How buyers will reach you</p>
                    </div>
                    <FieldGroup label="WhatsApp Number" required>
                      <Input
                        type="tel"
                        placeholder="10-digit number (with country code optional)"
                        value={formData.whatsapp}
                        onChange={e => set("whatsapp", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Buyers will contact you directly on WhatsApp</p>
                    </FieldGroup>
                    <FieldGroup label="Alternate Number">
                      <Input
                        type="tel"
                        placeholder="Optional backup number"
                        value={formData.alternatePhone}
                        onChange={e => set("alternatePhone", e.target.value)}
                      />
                    </FieldGroup>
                    <FieldGroup label="Instagram Handle (Optional)">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                        <Input
                          placeholder="yourhandle"
                          className="pl-7"
                          value={formData.instagram}
                          onChange={e => set("instagram", e.target.value)}
                        />
                      </div>
                    </FieldGroup>
                    <FieldGroup label="Website (Optional)">
                      <Input
                        type="url"
                        placeholder="https://yoursite.com"
                        value={formData.website}
                        onChange={e => set("website", e.target.value)}
                      />
                    </FieldGroup>
                  </div>
                )}

                {/* ── Step 5: Images ── */}
                {step === 5 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold mb-0.5">Business Images</h2>
                      <p className="text-sm text-muted-foreground">Upload photos to make your listing stand out</p>
                    </div>

                    <FieldGroup label="Business Logo / Profile Image">
                      <ImageUpload
                        value={formData.imageUrl}
                        onChange={(url) => set("imageUrl", url)}
                        label="Upload Logo / Profile Image"
                        variant="square"
                      />
                    </FieldGroup>

                    <FieldGroup label="Cover / Banner Image">
                      <ImageUpload
                        value={formData.coverImageUrl}
                        onChange={(url) => set("coverImageUrl", url)}
                        label="Upload Cover / Banner Image"
                        variant="wide"
                      />
                    </FieldGroup>

                    <p className="text-xs text-muted-foreground">
                      Images are optional. You can always update them later from your dashboard.
                    </p>
                  </div>
                )}

                {/* ── Step 6: Pricing ── */}
                {step === 6 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold mb-0.5">Pricing & Services</h2>
                      <p className="text-sm text-muted-foreground">Help buyers understand what you offer</p>
                    </div>
                    <FieldGroup label="Price Range">
                      <div className="grid grid-cols-1 gap-2">
                        {PRICE_RANGES.map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => set("priceRange", r)}
                            className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                              formData.priceRange === r
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </FieldGroup>
                    <FieldGroup label="Services Offered">
                      <Textarea
                        placeholder="Enter your services, separated by commas&#10;e.g., Daily Tiffin, Weekly Combo, Party Orders, Custom Cakes"
                        rows={4}
                        className="resize-none"
                        value={formData.servicesOffered}
                        onChange={e => set("servicesOffered", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Separate services with commas — each will appear as a tag on your profile</p>
                    </FieldGroup>
                  </div>
                )}

                {/* ── Step 7: Preview ── */}
                {step === 7 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold mb-0.5">Preview Your Listing</h2>
                      <p className="text-sm text-muted-foreground">This is exactly how buyers will see your business</p>
                    </div>
                    <PreviewCard data={formData} society={formData.societyName} />
                    <div className="rounded-xl bg-muted/40 border border-border/50 p-4">
                      <p className="text-sm font-medium mb-2">Ready to submit?</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {[
                          `Business: ${formData.businessName}`,
                          `Category: ${formData.category}`,
                          `Society: ${formData.societyName || "—"}${formData.locality ? `, ${formData.locality}` : ""}${formData.city ? `, ${formData.city}` : ""}`,
                          `WhatsApp: ${formData.whatsapp}`,
                          formData.priceRange ? `Pricing: ${formData.priceRange}` : null,
                        ].filter(Boolean).map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground mb-1">After submitting:</p>
                      <p>Our team reviews your listing within 24 hours. Once approved, your profile goes live and buyers can start contacting you instantly.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40">
              <Button
                variant="outline"
                onClick={() => step > 1 ? setStep(s => s - 1) : setLocation("/")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {step === 1 ? "Cancel" : "Back"}
              </Button>

              <Button
                onClick={next}
                disabled={createBusiness.isPending}
                className="gap-2 font-bold"
              >
                {step === 7 ? (
                  createBusiness.isPending ? "Submitting…" : (
                    <><Zap className="w-4 h-4" />Submit for Approval</>
                  )
                ) : (
                  <>Next<ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save progress hint */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Your progress is saved as you go. You can always update details later from your dashboard.
        </p>
      </main>
    </div>
  );
}


