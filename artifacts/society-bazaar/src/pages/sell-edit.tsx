import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, CheckCircle2, ArrowLeft, ArrowRight, User, Building2,
  Phone, Image as ImageIcon, Tag, Eye, Zap,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import type { Business, Society } from "@/lib/api";

const CATEGORIES = [
  "Food & Tiffin", "Bakery & Sweets", "Tuition & Classes",
  "Fitness & Yoga", "Tailoring", "Beauty & Wellness", "Home Services", "Others",
];

const PRICE_RANGES = [
  "Under ₹200", "₹200–₹500", "₹500–₹1000", "₹1000–₹2000", "Above ₹2000",
];

interface FormData {
  ownerName: string;
  phone: string;
  email: string;
  businessName: string;
  category: string;
  description: string;
  yearsInBusiness: string;
  societyName: string;
  locality: string;
  tower: string;
  flatNumber: string;
  city: string;
  whatsapp: string;
  alternatePhone: string;
  instagram: string;
  website: string;
  imageUrl: string;
  coverImageUrl: string;
  priceRange: string;
  servicesOffered: string;
}

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
  const imgUrl = data.coverImageUrl || data.imageUrl;
  return (
    <div className="rounded-2xl overflow-hidden border border-border/60 shadow-lg bg-white">
      <div className="relative h-44 overflow-hidden bg-muted">
        {imgUrl && <img src={imgUrl} alt={data.businessName} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">✏️ Editing</span>
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
      </div>
    </div>
  );
}

function buildFormFromBusiness(biz: Business, society: Society | null): FormData {
  return {
    ownerName: biz.ownerName ?? "",
    phone: biz.phone ?? "",
    email: biz.email ?? "",
    businessName: biz.businessName ?? "",
    category: biz.category ?? "",
    description: biz.description ?? "",
    yearsInBusiness: biz.yearsInBusiness != null ? String(biz.yearsInBusiness) : "",
    societyName: society?.name ?? "",
    locality: society?.locality ?? "",
    tower: biz.tower ?? "",
    flatNumber: biz.flatNumber ?? "",
    city: biz.city ?? society?.city ?? "",
    whatsapp: biz.whatsapp ?? "",
    alternatePhone: biz.alternatePhone ?? "",
    instagram: biz.instagram ?? "",
    website: biz.website ?? "",
    imageUrl: biz.imageUrl ?? "",
    coverImageUrl: biz.coverImageUrl ?? "",
    priceRange: biz.priceRange ?? "",
    servicesOffered: biz.servicesOffered ?? "",
  };
}

export default function SellEdit() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const businessId = Number(params.id);
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [saved, setSaved] = useState(false);

  const { data: societies } = useQuery({
    queryKey: ["societies", formData?.city, formData?.locality],
    queryFn: () => api.societies.list(formData?.city || undefined, formData?.locality || undefined),
    enabled: !!formData?.city && !!formData?.locality,
  });

  const isValidId = Number.isFinite(businessId) && businessId > 0;

  const { data: myBusinesses, isLoading, isError, error } = useQuery({
    queryKey: ["my-businesses"],
    queryFn: () => api.businesses.mine(),
    enabled: isValidId,
    retry: 1,
  });

  const existing = myBusinesses?.find(r => r.business.id === businessId);

  // Pre-fill form once data is loaded
  useEffect(() => {
    if (existing && !formData) {
      setFormData(buildFormFromBusiness(existing.business, existing.society));
    }
  }, [existing, formData]);

  const set = (field: keyof FormData, val: string) =>
    setFormData(prev => prev ? { ...prev, [field]: val } : prev);

  const updateBusiness = useMutation({
    mutationFn: async () => {
      if (!formData) return;
      const society = await api.societies.findOrCreate(formData.societyName, formData.city, formData.locality);
      return api.businesses.update(businessId, {
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
    onSuccess: () => setSaved(true),
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  function canProceed(): boolean {
    if (!formData) return false;
    switch (step) {
      case 1: return !!formData.ownerName.trim() && !!formData.phone.trim() && !!formData.email.trim();
      case 2: return !!formData.businessName.trim() && !!formData.category && !!formData.description.trim();
      case 3: return !!formData.societyName.trim() && !!formData.locality.trim() && !!formData.city.trim();
      case 4: return !!formData.whatsapp.trim();
      default: return true;
    }
  }

  function next() {
    if (!canProceed()) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    if (step < 7) setStep(s => s + 1);
    else updateBusiness.mutate();
  }

  const slideVariants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  };

  // Detect invalid or missing ID immediately
  if (!isValidId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-sm">
          <p className="font-bold mb-2">Invalid Listing</p>
          <p className="text-sm text-muted-foreground mb-4">No listing ID was provided or the ID is invalid.</p>
          <Button onClick={() => setLocation("/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  if (isError) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[sell-edit] Failed to load listing:", errorMessage);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-sm">
          <p className="font-bold mb-2">Could not load listing</p>
          <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
          <Button onClick={() => setLocation("/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  // If the query completed successfully but no business was found with that ID
  if (!isLoading && myBusinesses && !existing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-sm">
          <p className="font-bold mb-2">Could not load listing</p>
          <p className="text-sm text-muted-foreground mb-4">Business not found or not authorized</p>
          <Button onClick={() => setLocation("/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading listing…</div>
      </div>
    );
  }

  if (saved) {
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
              <h2 className="text-2xl font-bold mb-3">Changes Saved!</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Your listing has been updated.<br />
                {existing?.business.status === "approved"
                  ? "Since it was previously approved, it has been sent for re-review. It will be live again within 24 hours."
                  : "Your changes are saved and will be reviewed shortly."}
              </p>
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
          <button onClick={() => setLocation("/dashboard")} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />Back to Dashboard
          </button>
        }
      />

      {/* Header */}
      <div className="bg-gradient-to-b from-primary/8 to-background border-b border-border/30 py-8">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-3 border border-primary/20">
            ✏️ Editing: {formData.businessName}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Edit Your Listing</h1>
          <p className="text-muted-foreground text-sm mt-1">Update your business details. Changes will be sent for re-review if previously approved.</p>
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
                {/* Step 1: Personal */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold mb-0.5">Personal Information</h2>
                      <p className="text-sm text-muted-foreground">Update your personal details</p>
                    </div>
                    <FieldGroup label="Full Name" required>
                      <Input value={formData.ownerName} onChange={e => set("ownerName", e.target.value)} />
                    </FieldGroup>
                    <FieldGroup label="Mobile Number" required>
                      <Input type="tel" value={formData.phone} onChange={e => set("phone", e.target.value)} />
                    </FieldGroup>
                    <FieldGroup label="Email Address" required>
                      <Input type="email" value={formData.email} onChange={e => set("email", e.target.value)} />
                    </FieldGroup>
                  </div>
                )}

                {/* Step 2: Business */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold mb-0.5">Business Information</h2>
                      <p className="text-sm text-muted-foreground">Update your business details</p>
                    </div>
                    <FieldGroup label="Business Name" required>
                      <Input value={formData.businessName} onChange={e => set("businessName", e.target.value)} />
                    </FieldGroup>
                    <FieldGroup label="Category" required>
                      <Select value={formData.category} onValueChange={v => set("category", v)}>
                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FieldGroup>
                    <FieldGroup label="Business Description" required>
                      <Textarea rows={4} className="resize-none" value={formData.description} onChange={e => set("description", e.target.value)} />
                    </FieldGroup>
                    <FieldGroup label="Years in Business">
                      <Input type="number" min={0} max={50} value={formData.yearsInBusiness} onChange={e => set("yearsInBusiness", e.target.value)} />
                    </FieldGroup>
                  </div>
                )}

                {/* Step 3: Location */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold mb-0.5">Location</h2>
                      <p className="text-sm text-muted-foreground">Update your society and address</p>
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
                          id="edit-society-name-input"
                          list="edit-society-suggestions"
                          placeholder={formData.locality ? "Type your society name" : "Please select a locality first"}
                          value={formData.societyName}
                          onChange={e => set("societyName", e.target.value)}
                          autoComplete="off"
                          disabled={!formData.locality}
                        />
                        <datalist id="edit-society-suggestions">
                          {societies?.map(s => (
                            <option key={s.id} value={s.name} />
                          ))}
                        </datalist>
                      </div>
                    </FieldGroup>
                    <FieldGroup label="Tower / Wing">
                      <Input placeholder="e.g., Tower B, Wing A" value={formData.tower} onChange={e => set("tower", e.target.value)} />
                    </FieldGroup>
                    <FieldGroup label="Flat Number (Optional)">
                      <Input placeholder="e.g., B-304" value={formData.flatNumber} onChange={e => set("flatNumber", e.target.value)} />
                    </FieldGroup>
                  </div>
                )}

                {/* Step 4: Contact */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold mb-0.5">Business Contact</h2>
                      <p className="text-sm text-muted-foreground">Update how buyers will reach you</p>
                    </div>
                    <FieldGroup label="WhatsApp Number" required>
                      <Input type="tel" value={formData.whatsapp} onChange={e => set("whatsapp", e.target.value)} />
                      <p className="text-xs text-muted-foreground mt-1">Buyers will contact you directly on WhatsApp</p>
                    </FieldGroup>
                    <FieldGroup label="Alternate Number">
                      <Input type="tel" value={formData.alternatePhone} onChange={e => set("alternatePhone", e.target.value)} />
                    </FieldGroup>
                    <FieldGroup label="Instagram Handle (Optional)">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                        <Input placeholder="yourhandle" className="pl-7" value={formData.instagram} onChange={e => set("instagram", e.target.value)} />
                      </div>
                    </FieldGroup>
                    <FieldGroup label="Website (Optional)">
                      <Input type="url" placeholder="https://yoursite.com" value={formData.website} onChange={e => set("website", e.target.value)} />
                    </FieldGroup>
                  </div>
                )}

                {/* Step 5: Images */}
                {step === 5 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold mb-0.5">Business Images</h2>
                      <p className="text-sm text-muted-foreground">Upload or update your images</p>
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
                  </div>
                )}

                {/* Step 6: Pricing */}
                {step === 6 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold mb-0.5">Pricing & Services</h2>
                      <p className="text-sm text-muted-foreground">Update what you offer</p>
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
                        placeholder="Enter your services, separated by commas"
                        rows={4}
                        className="resize-none"
                        value={formData.servicesOffered}
                        onChange={e => set("servicesOffered", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Separate services with commas — each will appear as a tag</p>
                    </FieldGroup>
                  </div>
                )}

                {/* Step 7: Preview */}
                {step === 7 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold mb-0.5">Preview Your Changes</h2>
                      <p className="text-sm text-muted-foreground">Review everything before saving</p>
                    </div>
                    <PreviewCard data={formData} society={formData.societyName} />
                    <div className="rounded-xl bg-muted/40 border border-border/50 p-4">
                      <p className="text-sm font-medium mb-2">Ready to save?</p>
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
                    {existing?.business.status === "approved" && (
                      <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
                        <p className="font-semibold mb-1">⚠️ Re-review required</p>
                        <p>Since your listing is currently approved, saving changes will mark it as <strong>Pending Review</strong> until an admin re-approves it.</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40">
              <Button
                variant="outline"
                onClick={() => step > 1 ? setStep(s => s - 1) : setLocation("/dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {step === 1 ? "Cancel" : "Back"}
              </Button>

              <Button
                onClick={next}
                disabled={updateBusiness.isPending}
                className="gap-2 font-bold"
              >
                {step === 7 ? (
                  updateBusiness.isPending ? "Saving…" : (
                    <><CheckCircle2 className="w-4 h-4" />Save Changes</>
                  )
                ) : (
                  <>Next<ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Saving changes on an approved listing will send it for re-review.
        </p>
      </main>
    </div>
  );
}
