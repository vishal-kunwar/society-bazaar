import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, CheckCircle2, XCircle, Clock, TrendingUp, Building2, Users, LogOut,
  ShieldCheck, IndianRupee, Eye, ExternalLink, ChevronLeft, ChevronRight, X,
  Phone, MessageSquare, Globe, Instagram, AlertTriangle, Image, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import type { Business, Society } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";
import { SUPPORTED_CITIES } from "@/lib/cities";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  paused: "bg-gray-100 text-gray-700 border-gray-300",
};

type BizRow = { business: Business; society: Society | null };

function getDaysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function calcCompleteness(biz: Business): { pct: number; missing: string[] } {
  const fields: { key: keyof Business; label: string }[] = [
    { key: "ownerName", label: "Owner Name" },
    { key: "businessName", label: "Business Name" },
    { key: "phone", label: "Phone" },
    { key: "whatsapp", label: "WhatsApp" },
    { key: "description", label: "Description" },
    { key: "category", label: "Category" },
    { key: "imageUrl", label: "Logo Image" },
    { key: "email", label: "Email" },
    { key: "city", label: "City" },
    { key: "instagram", label: "Instagram" },
    { key: "website", label: "Website" },
    { key: "priceRange", label: "Price Range" },
    { key: "servicesOffered", label: "Services Offered" },
    { key: "coverImageUrl", label: "Cover Image" },
    { key: "yearsInBusiness", label: "Years in Business" },
  ];
  const missing = fields.filter(f => !biz[f.key]).map(f => f.label);
  const pct = Math.round(((fields.length - missing.length) / fields.length) * 100);
  return { pct, missing };
}

// ─── Lightbox ───────────────────────────────────────────────────────────────
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <X className="w-8 h-8" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

// ─── Image Thumbnail ─────────────────────────────────────────────────────────
function ImageThumb({ src, alt, onClick }: { src?: string | null; alt: string; onClick?: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src) {
    return (
      <div className="w-full h-28 rounded-xl bg-muted flex items-center justify-center border border-border/40">
        <Image className="w-8 h-8 text-muted-foreground/40" />
        <span className="text-xs text-muted-foreground ml-2">No image</span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-28 rounded-xl overflow-hidden border border-border/40 bg-muted ${onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""}`}
      onClick={onClick}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <Image className="w-8 h-8 text-muted-foreground/30" />
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80">
          <AlertTriangle className="w-6 h-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mt-1">Failed to load</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
      {onClick && loaded && (
        <div className="absolute bottom-1.5 right-1.5 bg-black/60 rounded-md px-1.5 py-0.5">
          <span className="text-[10px] text-white">Click to enlarge</span>
        </div>
      )}
    </div>
  );
}

// ─── Approval Dialog ─────────────────────────────────────────────────────────
function ApprovalDialog({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6 border border-border/50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Approve Listing?</h3>
            <p className="text-xs text-muted-foreground">This will make the listing live and visible to buyers.</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Approving…" : "Approve"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Rejection Dialog ────────────────────────────────────────────────────────
function RejectionDialog({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) setReason("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6 border border-border/50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Reject Listing</h3>
            <p className="text-xs text-muted-foreground">This will notify the seller with your reason.</p>
          </div>
        </div>
        <label className="block text-sm font-semibold mb-2">
          Rejection Reason <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="Example: Images are unclear, business description is incomplete, WhatsApp number is invalid..."
          rows={4}
          className="resize-none mb-4"
          value={reason}
          onChange={e => setReason(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={!reason.trim() || isPending}
            onClick={() => onConfirm(reason.trim())}
          >
            {isPending ? "Rejecting…" : "Confirm Rejection"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── End Deal Dialog ────────────────────────────────────────────────────────
function EndDealDialog({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) setReason("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6 border border-border/50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">End Daily Deal</h3>
            <p className="text-xs text-muted-foreground">This will immediately expire the deal for all buyers.</p>
          </div>
        </div>
        <label className="block text-sm font-semibold mb-2">
          Reason for Ending Deal <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="Specify why you are ending this deal..."
          className="mb-4 bg-muted/30 border-border/60"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={!reason.trim() || isPending}
            onClick={() => onConfirm(reason)}
          >
            {isPending ? "Ending..." : "End Deal"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}


// ─── Listing Review Modal ────────────────────────────────────────────────────
function ListingReviewModal({
  rows,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  onApprove,
  onReject,
  isUpdating,
}: {
  rows: BizRow[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isUpdating: boolean;
}) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const row = rows[currentIndex];
  const biz = row?.business;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  if (!biz) return null;

  const { pct, missing } = calcCompleteness(biz);
  const daysSince = getDaysSince(biz.createdAt);

  const infoRows: { label: string; value?: string | number | null }[] = [
    { label: "Business Name", value: biz.businessName },
    { label: "Category", value: biz.category },
    { label: "Owner Name", value: biz.ownerName },
    { label: "Phone", value: biz.phone },
    { label: "WhatsApp", value: biz.whatsapp },
    { label: "Email", value: biz.email },
    { label: "City", value: biz.city },
    { label: "Locality", value: row.society?.locality ?? biz.city },
    { label: "Society", value: row.society?.name },
    { label: "Price Range", value: biz.priceRange },
    { label: "Services / Products", value: biz.servicesOffered },
    { label: "Years in Business", value: biz.yearsInBusiness },
    { label: "Tower / Flat", value: [biz.tower, biz.flatNumber].filter(Boolean).join(", ") || null },
    { label: "Instagram", value: biz.instagram },
    { label: "Website", value: biz.website },
    { label: "Submitted On", value: new Date(biz.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
    { label: "Current Status", value: biz.status.charAt(0).toUpperCase() + biz.status.slice(1) },
  ];

  return (
    <>
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} alt="Preview" onClose={() => setLightboxSrc(null)} />
      )}

      <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-background rounded-2xl shadow-2xl w-full max-w-3xl border border-border/50 my-4"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-border/40 sticky top-0 bg-background rounded-t-2xl z-10">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-lg">{biz.businessName}</h2>
              <Badge className={`text-xs border ${STATUS_COLORS[biz.status]}`}>
                {biz.status.charAt(0).toUpperCase() + biz.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground mr-2">
                {currentIndex + 1} / {rows.length}
              </span>
              <Button size="sm" variant="outline" onClick={onPrev} disabled={currentIndex === 0} aria-label="Previous">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={onNext} disabled={currentIndex === rows.length - 1} aria-label="Next">
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose} aria-label="Close">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Pending Since & Profile Completeness */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                <p className="text-xs font-semibold text-yellow-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Pending Since
                </p>
                <p className="text-xl font-bold text-yellow-800">{daysSince} {daysSince === 1 ? "day" : "days"}</p>
                <p className="text-xs text-yellow-600 mt-0.5">Submitted {new Date(biz.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/60 border border-border/40">
                <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-primary" /> Profile Completeness
                </p>
                <div className="flex items-end gap-2 mb-2">
                  <p className="text-xl font-bold">{pct}%</p>
                  <p className="text-xs text-muted-foreground mb-0.5">complete</p>
                </div>
                <Progress value={pct} className="h-2 mb-2" />
                {missing.length > 0 && (
                  <p className="text-xs text-red-600 flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    Missing: {missing.join(", ")}
                  </p>
                )}
              </div>
            </div>

            {/* Images */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Images</h3>
              {!biz.imageUrl && !biz.coverImageUrl ? (
                <div className="p-6 rounded-xl bg-muted flex items-center justify-center border border-border/40">
                  <Image className="w-8 h-8 text-muted-foreground/40 mr-2" />
                  <span className="text-sm text-muted-foreground">No image uploaded</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {biz.imageUrl ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium">Business Logo</p>
                      <ImageThumb
                        src={biz.imageUrl}
                        alt="Business Logo"
                        onClick={() => setLightboxSrc(biz.imageUrl)}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium">Business Logo</p>
                      <div className="w-full h-28 rounded-xl bg-muted flex items-center justify-center border border-border/40">
                        <span className="text-xs text-muted-foreground">No logo uploaded</span>
                      </div>
                    </div>
                  )}
                  {biz.coverImageUrl ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium">Cover Image</p>
                      <ImageThumb
                        src={biz.coverImageUrl}
                        alt="Cover Image"
                        onClick={() => setLightboxSrc(biz.coverImageUrl!)}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium">Cover Image</p>
                      <div className="w-full h-28 rounded-xl bg-muted flex items-center justify-center border border-border/40">
                        <span className="text-xs text-muted-foreground">No cover image uploaded</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-sm mb-2">Description</h3>
              <p className="text-sm text-foreground/80 bg-muted/40 rounded-xl p-4 leading-relaxed border border-border/30">
                {biz.description || <span className="text-red-500">⚠ No description provided</span>}
              </p>
            </div>

            {/* Details Grid */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Full Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                {infoRows.map(({ label, value }) => (
                  <div key={label} className={`flex justify-between py-1.5 border-b border-border/30 text-sm ${!value ? "text-red-500" : ""}`}>
                    <span className="font-medium text-muted-foreground">{label}</span>
                    <span className={`text-right max-w-[55%] truncate ${!value ? "text-red-400 italic" : "text-foreground"}`}>
                      {value ?? "Not provided"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            {(biz.instagram || biz.website) && (
              <div className="flex items-center gap-3 flex-wrap">
                {biz.instagram && (
                  <a href={biz.instagram.startsWith("http") ? biz.instagram : `https://instagram.com/${biz.instagram}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-pink-600 hover:underline">
                    <Instagram className="w-3.5 h-3.5" /> {biz.instagram}
                  </a>
                )}
                {biz.website && (
                  <a href={biz.website.startsWith("http") ? biz.website : `https://${biz.website}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                    <Globe className="w-3.5 h-3.5" /> {biz.website}
                  </a>
                )}
              </div>
            )}

            {/* Rejection Reason (if previously rejected) */}
            {biz.rejectionReason && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-xs font-bold text-red-700 mb-1">Previous Rejection Reason</p>
                <p className="text-xs text-red-600">{biz.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 p-5 border-t border-border/40 flex-wrap sticky bottom-0 bg-background rounded-b-2xl">
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`${basePath}/business/${biz.id}`, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-1" /> Public Preview
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {biz.status !== "approved" && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isUpdating}
                  onClick={() => onApprove(biz.id)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                </Button>
              )}
              {biz.status !== "rejected" && (
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isUpdating}
                  onClick={() => onReject(biz.id)}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ─── Listing Card (with per-card lightbox) ───────────────────────────────────
function ListingCard({
  row,
  idx,
  tab,
  onReview,
  onApprove,
  onReject,
  isUpdating,
}: {
  row: BizRow;
  idx: number;
  tab: string;
  onReview: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isUpdating: boolean;
}) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const biz = row.business;
  const daysSince = getDaysSince(biz.createdAt);
  const { pct, missing } = calcCompleteness(biz);

  const hasLogo = Boolean(biz.imageUrl);
  const hasCover = Boolean(biz.coverImageUrl);

  return (
    <>
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} alt="Image preview" onClose={() => setLightboxSrc(null)} />
      )}
      <motion.div
        key={biz.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="mb-4"
      >
        <Card className="border-border/50 hover:border-primary/30 transition-colors">
          <CardContent className="p-5">

            {/* ── Image strip ─────────────────────────────────── */}
            <div className="flex flex-col gap-1.5 mb-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Uploaded Images</p>
              {!biz.imageUrl && !biz.coverImageUrl ? (
                <div className="h-20 rounded-lg border border-dashed border-border/50 bg-muted/40 flex flex-col items-center justify-center gap-1">
                  <Image className="w-5 h-5 text-muted-foreground/30" />
                  <span className="text-[10px] text-muted-foreground/50 text-center leading-tight">No image uploaded</span>
                </div>
              ) : (
                <div className="flex gap-3">
                  {/* Logo */}
                  {biz.imageUrl && (
                    <div className="flex-1">
                      <p className="text-[9px] text-muted-foreground mb-1">Logo</p>
                      <div
                        className="h-20 rounded-lg overflow-hidden border border-border/40 bg-muted cursor-pointer hover:opacity-90 transition-opacity relative group"
                        onClick={() => setLightboxSrc(biz.imageUrl)}
                        title="Click to enlarge"
                      >
                        <img
                          src={biz.imageUrl}
                          alt="Business logo"
                          className="w-full h-full object-cover"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.parentElement!.querySelector(".img-err") as HTMLElement).style.display = "flex"; }}
                        />
                        <div className="img-err absolute inset-0 hidden flex-col items-center justify-center bg-muted">
                          <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground mt-0.5">Failed to load</span>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-end p-1">
                          <span className="text-[9px] text-white bg-black/50 rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cover */}
                  {biz.coverImageUrl && (
                    <div className="flex-[2]">
                      <p className="text-[9px] text-muted-foreground mb-1">Cover / Banner</p>
                      <div
                        className="h-20 rounded-lg overflow-hidden border border-border/40 bg-muted cursor-pointer hover:opacity-90 transition-opacity relative group"
                        onClick={() => setLightboxSrc(biz.coverImageUrl!)}
                        title="Click to enlarge"
                      >
                        <img
                          src={biz.coverImageUrl!}
                          alt="Cover image"
                          className="w-full h-full object-cover"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.parentElement!.querySelector(".img-err") as HTMLElement).style.display = "flex"; }}
                        />
                        <div className="img-err absolute inset-0 hidden flex-col items-center justify-center bg-muted">
                          <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground mt-0.5">Failed to load</span>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-end p-1">
                          <span className="text-[9px] text-white bg-black/50 rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Business info ───────────────────────────────── */}
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-bold text-lg">{biz.businessName}</h3>
                  <Badge className={`text-xs border ${STATUS_COLORS[biz.status]}`}>{biz.status}</Badge>
                  <Badge variant="secondary" className="text-xs">{biz.category}</Badge>
                  {tab === "pending" && (
                    <span className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-1.5 py-0.5">
                      Pending {daysSince}d
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{biz.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs text-muted-foreground mb-4 bg-muted/30 p-3 rounded-lg border border-border/20">
                  <div><strong>Owner / Seller:</strong> <span className="text-foreground">{biz.ownerName}</span></div>
                  <div><strong>Category:</strong> <span className="text-foreground">{biz.category}</span></div>
                  <div><strong>City:</strong> <span className="text-foreground">{biz.city ?? row.society?.city ?? "—"}</span></div>
                  <div><strong>Locality:</strong> <span className="text-foreground">{row.society?.locality ?? "—"}</span></div>
                  <div><strong>Society:</strong> <span className="text-foreground">{row.society?.name ?? "—"}</span></div>
                  <div><strong>Price Range:</strong> <span className="text-foreground">{biz.priceRange ?? "Not specified"}</span></div>
                  <div className="sm:col-span-2">
                    <strong>Contact:</strong>{" "}
                    <span className="text-foreground">
                      📞 Phone: {biz.phone} {biz.whatsapp ? `| 💬 WhatsApp: ${biz.whatsapp}` : ""}
                    </span>
                  </div>
                  {biz.servicesOffered && (
                    <div className="sm:col-span-2">
                      <strong>Services / Products:</strong>{" "}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {biz.servicesOffered.split(",").map((s, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] bg-background">{s.trim()}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {biz.status === "rejected" && biz.rejectionReason && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs">
                    <p className="font-semibold text-red-800 mb-1">❌ Rejection Reason</p>
                    <p className="text-red-700">{biz.rejectionReason}</p>
                    <p className="text-muted-foreground mt-1.5">
                      Rejected Date: {new Date(biz.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                )}

                {/* Profile completeness */}
                <div className="flex items-center gap-2">
                  <Progress value={pct} className="h-1.5 flex-1 max-w-[120px]" />
                  <span className={`text-xs font-medium ${pct < 60 ? "text-red-600" : pct < 85 ? "text-yellow-600" : "text-green-600"}`}>
                    {pct}% complete
                  </span>
                  {missing.length > 0 && (
                    <span className="text-xs text-red-500 truncate max-w-[200px]">
                      Missing: {missing.slice(0, 3).join(", ")}{missing.length > 3 ? ` +${missing.length - 3}` : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0 flex-wrap">
                <Button size="sm" variant="outline" onClick={onReview}>
                  <Eye className="w-4 h-4 mr-1" /> Review
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`${basePath}/business/${biz.id}`, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-1" /> Preview
                </Button>
                {biz.status !== "approved" && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={isUpdating}
                    onClick={() => onApprove(biz.id)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                  </Button>
                )}
                {biz.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isUpdating}
                    onClick={() => onReject(biz.id)}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                )}
              </div>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || "/api"}/admin/logout`, { method: "POST", credentials: "include" });
    } catch (err) {}
    localStorage.removeItem("admin_token");
    setLocation("/admin-login");
  };

  const [activeTab, setActiveTab] = useState("pending");
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
  const [approveTargetId, setApproveTargetId] = useState<number | null>(null);

  const [endDealTargetId, setEndDealTargetId] = useState<number | null>(null);

  const [selectedDistCity, setSelectedDistCity] = useState("Pune");
  const [selectedDistLocality, setSelectedDistLocality] = useState("");

  useEffect(() => {
    if (!stats?.sellerDistribution) return;
    const localities = Array.from(
      new Set(
        stats.sellerDistribution
          .filter((d: any) => d.city.toLowerCase() === selectedDistCity.toLowerCase())
          .map((d: any) => d.locality)
          .filter(Boolean)
      )
    ) as string[];
    if (localities.length > 0) {
      setSelectedDistLocality(localities[0]);
    } else {
      setSelectedDistLocality("");
    }
  }, [selectedDistCity, stats?.sellerDistribution]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.admin.stats(),
  });

  const { data: businesses, isLoading: bizLoading } = useQuery({
    queryKey: ["admin-businesses", activeTab],
    queryFn: () => api.admin.businesses(activeTab),
    enabled: activeTab !== "payments" && activeTab !== "deals",
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: number; status: string; rejectionReason?: string }) =>
      api.admin.updateStatus(id, status, rejectionReason),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-businesses"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      const msg = vars.status === "approved" ? "Listing approved ✅" : "Listing rejected ❌";
      toast({ title: msg });
      setRejectTargetId(null);
      setApproveTargetId(null);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => api.admin.payments(),
    enabled: activeTab === "payments",
  });

  const approvePayment = useMutation({
    mutationFn: (id: number) => api.admin.updatePayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      toast({ title: "Payment approved" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const { data: adminDeals, isLoading: dealsLoading } = useQuery({
    queryKey: ["admin-deals"],
    queryFn: () => api.admin.deals(),
    enabled: activeTab === "deals",
  });

  const adminEndDeal = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      api.admin.endDeal(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-deals"] });
      toast({ title: "Daily Deal ended successfully ✅" });
      setEndDealTargetId(null);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });


  const bizRows = (businesses ?? []) as BizRow[];

  const handleApprove = (id: number) => {
    setApproveTargetId(id);
  };

  const handleConfirmApproval = () => {
    if (!approveTargetId) return;
    updateStatus.mutate({ id: approveTargetId, status: "approved" });
    setReviewIndex(null);
  };

  const handleReject = (id: number) => {
    setRejectTargetId(id);
  };

  const handleConfirmRejection = (reason: string) => {
    if (!rejectTargetId) return;
    updateStatus.mutate({ id: rejectTargetId, status: "rejected", rejectionReason: reason });
    setReviewIndex(null);
  };

  const statCards = [
    { label: "Total Businesses", value: stats?.totalBusinesses ?? "—", icon: Building2 },
    { label: "Pending Review", value: stats?.pendingBusinesses ?? "—", icon: Clock },
    { label: "Active Sellers", value: stats?.approvedBusinesses ?? "—", icon: Users },
    { label: "Total Leads", value: stats?.totalLeads ?? "—", icon: TrendingUp },
  ];

  const cityStats = SUPPORTED_CITIES.map(c => {
    const count = stats?.sellerDistribution?.filter((d: any) => d.city.toLowerCase() === c.toLowerCase()).length ?? 0;
    return { name: c, count };
  });

  const localityMap = new Map<string, number>();
  stats?.sellerDistribution?.forEach((d: any) => {
    if (d.city && d.city.toLowerCase() === selectedDistCity.toLowerCase() && d.locality) {
      localityMap.set(d.locality, (localityMap.get(d.locality) ?? 0) + 1);
    }
  });
  const localityStats = Array.from(localityMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const societyMap = new Map<string, number>();
  stats?.sellerDistribution?.forEach((d: any) => {
    if (
      d.city && d.city.toLowerCase() === selectedDistCity.toLowerCase() &&
      d.locality && d.locality.toLowerCase() === selectedDistLocality?.toLowerCase() &&
      d.societyName
    ) {
      societyMap.set(d.societyName, (societyMap.get(d.societyName) ?? 0) + 1);
    }
  });
  const societyStats = Array.from(societyMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar
        rightContent={
          <>
            <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />Admin
            </Badge>
            <div className="flex items-center gap-2 border-l border-border/40 pl-2 ml-1">
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />Sign Out
              </Button>
            </div>
          </>
        }
        mobileContent={
          <>
            <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold justify-center py-1 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />Admin Session
            </Badge>
            <Button variant="outline" size="sm" className="justify-start w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />Sign Out
            </Button>
          </>
        }
      />

      <main className="container mx-auto px-4 md:px-6 py-10 max-w-6xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage hustles, sellers, and the GoHustly community</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {statCards.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{statsLoading ? "…" : stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {stats?.topCategories && stats.topCategories.length > 0 && (
          <Card className="mb-10 border-border/50">
            <CardHeader><CardTitle className="text-base font-semibold">Top Categories</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {stats.topCategories.map((cat: any, i: number) => (
                  <div key={i} className="bg-muted/50 border border-border/40 p-3 rounded-xl flex flex-col justify-between">
                    <span className="text-xs font-bold text-foreground truncate mb-2 block">{cat.category}</span>
                    <div className="space-y-0.5 text-xs text-muted-foreground">
                      <div>Businesses: <span className="font-semibold text-foreground">{cat.count}</span></div>
                      <div>Leads: <span className="font-semibold text-primary">{cat.leadCount ?? 0}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {stats?.sellerDistribution && (
          <Card className="mb-10 border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Seller Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* City column */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground border-b border-border/40 pb-2">City</h4>
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {cityStats.map(item => (
                      <button
                        key={item.name}
                        onClick={() => setSelectedDistCity(item.name)}
                        className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg border transition-all text-left ${
                          selectedDistCity.toLowerCase() === item.name.toLowerCase()
                            ? "bg-primary/10 border-primary text-foreground font-semibold"
                            : "bg-muted/30 border-border/40 hover:bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <span>{item.name}</span>
                        <span className="font-semibold">{item.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Locality column */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground border-b border-border/40 pb-2">
                    Localities <span className="text-xs font-normal text-muted-foreground">(in {selectedDistCity})</span>
                  </h4>
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {localityStats.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">No localities found</p>
                    ) : (
                      localityStats.map(item => (
                        <button
                          key={item.name}
                          onClick={() => setSelectedDistLocality(item.name)}
                          className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg border transition-all text-left ${
                            selectedDistLocality?.toLowerCase() === item.name.toLowerCase()
                              ? "bg-primary/10 border-primary text-foreground font-semibold"
                              : "bg-muted/30 border-border/40 hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <span>{item.name}</span>
                          <span className="font-semibold">{item.count}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Society column */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground border-b border-border/40 pb-2">
                    Societies <span className="text-xs font-normal text-muted-foreground">({selectedDistLocality ? `in ${selectedDistLocality}` : "no locality selected"})</span>
                  </h4>
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {!selectedDistLocality || societyStats.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">No societies found</p>
                    ) : (
                      societyStats.map(item => (
                        <div
                          key={item.name}
                          className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg border bg-muted/30 border-border/40 text-muted-foreground text-left"
                        >
                          <span className="truncate pr-2">{item.name}</span>
                          <span className="font-semibold shrink-0">{item.count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <h2 className="text-xl font-bold mb-5">Business Approvals</h2>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setReviewIndex(null); }}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="deals">Daily Deals</TabsTrigger>
          </TabsList>

          {/* Payments Tab */}
          <TabsContent value="payments">
            {paymentsLoading && <div className="grid gap-4">{[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>}
            {!paymentsLoading && (!payments || payments.length === 0) && (
              <div className="text-center py-16 text-muted-foreground">No pending payments.</div>
            )}
            {!paymentsLoading && payments?.map((row: any) => {
              const { payment, business } = row;
              return (
                <Card key={payment.id} className="mb-4 border-border/50">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{business?.businessName ?? "Unknown Business"}</h3>
                      <h4 className="font-semibold text-primary">Amount: ₹{payment.amount}</h4>
                      <p className="text-sm text-muted-foreground mt-1">UTR: <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{payment.utrNumber}</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Submitted: {new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                    {payment.status === "pending" ? (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={approvePayment.isPending}
                        onClick={() => approvePayment.mutate(payment.id)}
                      >
                        <IndianRupee className="w-4 h-4 mr-1" /> Approve Payment
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Daily Deals Tab */}
          <TabsContent value="deals">
            {dealsLoading && <div className="grid gap-4">{[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>}
            {!dealsLoading && (!adminDeals || adminDeals.length === 0) && (
              <div className="text-center py-16 text-muted-foreground">No daily deals found.</div>
            )}
            {!dealsLoading && adminDeals?.map((row) => {
              const { deal, business, society, status } = row;
              const statusConfig = {
                scheduled: { label: "⏰ Scheduled", classes: "bg-blue-100 text-blue-800 border-blue-200" },
                active:    { label: "🔥 Active",    classes: "bg-orange-100 text-orange-800 border-orange-200" },
                expired:   { label: "✓ Expired",   classes: "bg-gray-100 text-gray-600 border-gray-200" },
              }[status] || { label: "✓ Expired", classes: "bg-gray-100 text-gray-600 border-gray-200" };

              return (
                <Card key={deal.id} className="mb-4 border-border/50">
                  <CardContent className="p-5 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg">{business.businessName}</h3>
                        <Badge className={`text-xs border ${statusConfig.classes}`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Owner: <span className="text-foreground font-medium">{business.ownerName}</span>
                        {society && ` · ${society.name}, ${society.city}`}
                      </p>
                      <div className="bg-muted/30 border border-border/20 p-3 rounded-lg mt-2 space-y-1">
                        <p className="font-semibold text-sm">{deal.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{deal.description}</p>
                        {deal.offerPrice && (
                          <p className="text-xs font-bold text-orange-600">Offer Price: {deal.offerPrice}</p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground pt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Starts: {new Date(deal.startsAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} IST</span>
                        <span>Expires: {new Date(deal.expiresAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} IST</span>
                      </div>
                    </div>
                    {status !== "expired" && (
                      <div className="self-start md:self-center shrink-0">
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={adminEndDeal.isPending}
                          onClick={() => setEndDealTargetId(deal.id)}
                        >
                          End Deal
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Business listing tabs */}
          {["pending", "approved", "rejected"].map(tab => (
            <TabsContent key={tab} value={tab}>
              {bizLoading && <div className="grid gap-4">{[1, 2, 3].map(i => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>}
              {!bizLoading && !bizRows.length && (
                <div className="text-center py-16 text-muted-foreground">
                  {tab === "pending" ? (
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-foreground">✅ All caught up!</div>
                      <div className="text-sm">There are no pending business approvals.</div>
                    </div>
                  ) : (
                    `No ${tab} businesses at the moment.`
                  )}
                </div>
              )}
              {!bizLoading && bizRows.map((row, idx) => (
                <ListingCard
                  key={row.business.id}
                  row={row}
                  idx={idx}
                  tab={tab}
                  onReview={() => setReviewIndex(idx)}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isUpdating={updateStatus.isPending}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Listing Review Modal */}
      <AnimatePresence>
        {reviewIndex !== null && bizRows.length > 0 && (
          <ListingReviewModal
            rows={bizRows}
            currentIndex={reviewIndex}
            onClose={() => setReviewIndex(null)}
            onPrev={() => setReviewIndex(i => Math.max(0, (i ?? 1) - 1))}
            onNext={() => setReviewIndex(i => Math.min(bizRows.length - 1, (i ?? 0) + 1))}
            onApprove={handleApprove}
            onReject={handleReject}
            isUpdating={updateStatus.isPending}
          />
        )}
      </AnimatePresence>

      {/* Rejection Dialog */}
      <RejectionDialog
        isOpen={rejectTargetId !== null}
        onClose={() => setRejectTargetId(null)}
        onConfirm={handleConfirmRejection}
        isPending={updateStatus.isPending}
      />

      {/* Approval Dialog */}
      <ApprovalDialog
        isOpen={approveTargetId !== null}
        onClose={() => setApproveTargetId(null)}
        onConfirm={handleConfirmApproval}
        isPending={updateStatus.isPending}
      />

      {/* End Deal Dialog */}
      <EndDealDialog
        isOpen={endDealTargetId !== null}
        onClose={() => setEndDealTargetId(null)}
        onConfirm={(reason) => adminEndDeal.mutate({ id: endDealTargetId!, reason })}
        isPending={adminEndDeal.isPending}
      />

    </div>
  );
}
