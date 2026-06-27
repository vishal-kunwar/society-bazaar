import { Router } from "express";
import multer from "multer";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middlewares/requireAuth";
import type { Request, Response } from "express";

const router = Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit as per user config
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF.`));
    }
  },
});

/**
 * POST /upload
 * Accepts a single file field named "file".
 * Returns { url: string } — the publicly accessible URL.
 */
router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Map mime types to safe extensions
      const extMap: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif"
      };
      const ext = extMap[file.mimetype] || ".jpg";
      const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("uploads")
        .upload(uniqueName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: "3600",
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("uploads")
        .getPublicUrl(data.path);

      res.json({ url: publicUrl });
    } catch (err: any) {
      console.error("Upload error:", err);
      res.status(500).json({ error: err.message || "Failed to upload file to storage" });
    }
  },
);

export default router;
