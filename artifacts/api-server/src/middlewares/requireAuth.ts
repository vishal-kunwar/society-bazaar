import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

export interface AuthedRequest extends Request {
  userId: string;
}

export const isClerkEnabled = process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY !== "[YOUR-CLERK-SECRET-KEY]" &&
  process.env.CLERK_SECRET_KEY.trim() !== "";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!isClerkEnabled) {
    (req as AuthedRequest).userId = "mock_user_id";
    next();
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

export const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? "").split(",").filter(Boolean);


export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!isClerkEnabled) {
    (req as AuthedRequest).userId = "mock_user_id";
    next();
    return;
  }
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (ADMIN_USER_IDS.length === 0 || !ADMIN_USER_IDS.includes(userId)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  (req as AuthedRequest).userId = userId;
  next();
};
