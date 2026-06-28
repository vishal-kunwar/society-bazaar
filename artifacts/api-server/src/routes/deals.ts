import { Router } from "express";
import { db } from "@workspace/db";
import { dailyDealsTable, businessesTable, societiesTable, leadsTable, feedPostsTable } from "@workspace/db";
import { eq, desc, gt, lte, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import type { AuthedRequest } from "../middlewares/requireAuth";
import type { Request, Response } from "express";

const router = Router();

// Public: only return deals that are currently active (startsAt <= now < expiresAt)
router.get("/deals", async (req: Request, res: Response) => {
  const now = new Date();
  const rows = await db
    .select({ deal: dailyDealsTable, business: businessesTable, society: societiesTable })
    .from(dailyDealsTable)
    .innerJoin(businessesTable, eq(dailyDealsTable.businessId, businessesTable.id))
    .leftJoin(societiesTable, eq(businessesTable.societyId, societiesTable.id))
    .where(
      and(
        eq(businessesTable.status, "approved"),
        lte(dailyDealsTable.startsAt, now),   // deal has started
        gt(dailyDealsTable.expiresAt, now),   // deal has not expired
      ),
    )
    .orderBy(desc(dailyDealsTable.createdAt))
    .limit(10);
  res.json(rows);
});

router.post("/deals", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { businessId, title, description, offerPrice, startsAt, expiresAt } = req.body;
  if (!businessId || !title || !description || !startsAt || !expiresAt) {
    res.status(400).json({ error: "businessId, title, description, startsAt, and expiresAt are required" });
    return;
  }

  const startsAtDate = new Date(startsAt);
  const expiresAtDate = new Date(expiresAt);
  const now = new Date();

  // Validate: expiry must be after start
  if (expiresAtDate <= startsAtDate) {
    res.status(400).json({ error: "Expiry time must be after start time." });
    return;
  }

  // Validate: expiry must be in the future
  if (expiresAtDate <= now) {
    res.status(400).json({ error: "Expiry time must be in the future." });
    return;
  }

  const [biz] = await db
    .select()
    .from(businessesTable)
    .where(and(eq(businessesTable.id, Number(businessId)), eq(businessesTable.clerkUserId, userId)))
    .limit(1);

  if (!biz) {
    res.status(403).json({ error: "Not your business" });
    return;
  }

  // 1. Check if there is already a non-expired deal for this business
  const existingDeals = await db
    .select()
    .from(dailyDealsTable)
    .where(
      and(
        eq(dailyDealsTable.businessId, Number(businessId)),
        gt(dailyDealsTable.expiresAt, now)
      )
    )
    .limit(1);

  if (existingDeals.length > 0) {
    res.status(400).json({ error: "An active or scheduled daily deal already exists for this business." });
    return;
  }

  // 2. Check plan and trial expiry
  const isPro = biz.subscriptionPlan === "pro" && biz.proValidUntil && new Date(biz.proValidUntil) > now;
  const daysSinceCreated = (Date.now() - new Date(biz.createdAt).getTime()) / (1000 * 60 * 60 * 24);

  const [leadCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leadsTable)
    .where(eq(leadsTable.businessId, biz.id));
  const leadCount = Number(leadCountRow?.count || 0);

  const trialExpired = !isPro && (leadCount >= 25 || daysSinceCreated >= 90);

  if (trialExpired) {
    res.status(403).json({ error: "Your free trial has expired. Please upgrade to Pro to create a new Daily Deal." });
    return;
  }

  // 3. Insert the Daily Deal
  const [deal] = await db
    .insert(dailyDealsTable)
    .values({
      businessId: Number(businessId),
      clerkUserId: userId,
      title,
      description,
      offerPrice: offerPrice || null,
      startsAt: startsAtDate,
      expiresAt: expiresAtDate,
    })
    .returning();

  // 4. Automatically publish as a post to the Society Feed
  // Use UTC ISO strings so the feed post body is timezone-neutral
  try {
    const startsDisplay = startsAtDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const expiresDisplay = expiresAtDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const feedBody = `${description}${offerPrice ? `\n\n💰 Offer Price: ${offerPrice}` : ""}\n\n🕐 Starts: ${startsDisplay} IST\n⏰ Ends: ${expiresDisplay} IST`;
    await db
      .insert(feedPostsTable)
      .values({
        businessId: Number(businessId),
        clerkUserId: userId,
        title: `🔥 New Daily Deal: ${title}`,
        body: feedBody,
        imageUrl: biz.imageUrl || "",
      });
  } catch (err) {
    console.error("Failed to automatically post daily deal to society feed:", err);
  }

  res.status(201).json(deal);
});

router.post("/deals/:id/view", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const [updated] = await db
    .update(dailyDealsTable)
    .set({ views: sql`${dailyDealsTable.views} + 1` })
    .where(eq(dailyDealsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Deal not found" });
    return;
  }
  res.json({ success: true, views: updated.views });
});

router.post("/deals/:id/click", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const [updated] = await db
    .update(dailyDealsTable)
    .set({ whatsappClicks: sql`${dailyDealsTable.whatsappClicks} + 1` })
    .where(eq(dailyDealsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Deal not found" });
    return;
  }
  res.json({ success: true, whatsappClicks: updated.whatsappClicks });
});

export default router;
