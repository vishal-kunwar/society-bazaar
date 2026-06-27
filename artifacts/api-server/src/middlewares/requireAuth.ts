import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

export interface AuthedRequest extends Request {
  userId: string;
}

export const isClerkEnabled = Boolean(
  process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY !== "[YOUR-CLERK-SECRET-KEY]" &&
  process.env.CLERK_SECRET_KEY.trim() !== ""
);

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!isClerkEnabled) {
    // Never silently grant access. Fail closed.
    res.status(503).json({ error: "Authentication service is not configured." });
    return;
  }
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as AuthedRequest).userId = userId;
  next();
};

