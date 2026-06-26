import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable, businessesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import type { AuthedRequest } from "../middlewares/requireAuth";
import type { Request, Response } from "express";

const router = Router();

router.post("/reviews", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { businessId, reviewerName, rating, comment } = req.body;

  if (!businessId || !reviewerName || !rating || !comment) {
    res.status(400).json({ error: "All fields required" });
    return;
  }
  if (Number(rating) < 1 || Number(rating) > 5) {
    res.status(400).json({ error: "Rating must be 1–5" });
    return;
  }

  const [biz] = await db
    .select({ id: businessesTable.id, status: businessesTable.status })
    .from(businessesTable)
    .where(eq(businessesTable.id, Number(businessId)))
    .limit(1);
  if (!biz) {
    res.status(404).json({ error: "Business not found" });
    return;
  }
  if (biz.status !== "approved") {
    res.status(400).json({ error: "Reviews can only be submitted for approved businesses" });
    return;
  }

  const [existingReview] = await db
    .select({ id: reviewsTable.id })
    .from(reviewsTable)
    .where(
      and(
        eq(reviewsTable.businessId, Number(businessId)),
        eq(reviewsTable.clerkUserId, userId),
      ),
    )
    .limit(1);
  if (existingReview) {
    res.status(409).json({ error: "You have already reviewed this business" });
    return;
  }

  const [review] = await db
    .insert(reviewsTable)
    .values({ businessId: Number(businessId), clerkUserId: userId, reviewerName, rating: Number(rating), comment })
    .returning();

  res.status(201).json(review);
});

export default router;
