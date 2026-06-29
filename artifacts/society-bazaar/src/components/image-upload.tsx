import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/react";

interface ImageUploadProps {
  /** Current image URL (can be empty string) */
  value: string;
  /** Called with the uploaded image's public URL */
  onChange: (url: string) => void;
  /** Label text for the upload area */
  label?: string;
  /** Shape variant for preview */
  variant?: "square" | "wide" | "square-full";
  /** Additional className for the wrapper */
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Upload Image",
  variant = "square",
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const token = await getToken();

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(body.error || `Upload failed (${res.status})`);
      }

      const { url } = await res.json();
      onChange(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      console.error("[ImageUpload] Error:", msg);
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function clearImage() {
    onChange("");
    setError(null);
  }

  const previewHeight = variant === "wide" ? "h-32" : (variant === "square-full" ? "aspect-square w-full" : "h-20 w-20");

  // If we have a current image, show preview with replace/remove options
  if (value) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className={`flex ${variant === "square" ? "items-end" : "flex-col"} gap-3`}>
          <div
            className={`${variant === "wide" ? "w-full h-32" : (variant === "square-full" ? "w-full aspect-square" : "w-20 h-20")} rounded-xl overflow-hidden border border-border bg-muted relative`}
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={clearImage}
            >
              Remove
            </Button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleInputChange}
        />
        {uploading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            Uploading…
          </div>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  // Empty state — show upload dropzone
  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        className={`border-2 border-dashed border-border/60 rounded-xl p-6 text-center cursor-pointer
          hover:border-primary/50 hover:bg-primary/5 transition-all
          ${uploading ? "pointer-events-none opacity-60" : ""}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Uploading…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-muted-foreground">
              Click to browse or drag & drop · JPEG, PNG, WebP · Max 5 MB
            </span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleInputChange}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
