import { Router } from "express";
import { db } from "@workspace/db";
import { businessesTable, societiesTable, reviewsTable, leadsTable, dailyDealsTable } from "@workspace/db";
import { eq, and, desc, sql, gt, lte } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import type { AuthedRequest } from "../middlewares/requireAuth";
import type { Request, Response } from "express";

const router = Router();

router.get("/businesses", async (req: Request, res: Response) => {
  const { societyId, category, city, locality, limit, offset } = req.query;
  const parsedLimit = limit ? Math.min(Number(limit), 100) : 50;
  const parsedOffset = offset ? Number(offset) : 0;

  const rows = await db
    .select({
      business: businessesTable,
      society: societiesTable,
      avgRating: sql<number>`COALESCE(AVG(${reviewsTable.rating}), 0)`,
      reviewCount: sql<number>`COUNT(DISTINCT ${reviewsTable.id})`,
      leadCount: sql<number>`COUNT(DISTINCT ${leadsTable.id})`,
    })
    .from(businessesTable)
    .leftJoin(societiesTable, eq(businessesTable.societyId, societiesTable.id))
    .leftJoin(reviewsTable, eq(reviewsTable.businessId, businessesTable.id))
    .leftJoin(leadsTable, eq(leadsTable.businessId, businessesTable.id))
    .where(
      and(
        eq(businessesTable.status, "approved"),
        societyId ? eq(businessesTable.societyId, Number(societyId)) : undefined,
        category && category !== "all" ? sql`${businessesTable.category} = ${category}` : undefined,
        city ? sql`lower(${societiesTable.city}) = lower(${city as string})` : undefined,
        locality ? sql`lower(${societiesTable.locality}) = lower(${locality as string})` : undefined
      ),
    )
    .groupBy(businessesTable.id, societiesTable.id)
    .orderBy(desc(businessesTable.createdAt))
    .limit(parsedLimit)
    .offset(parsedOffset);

  const enrichedRows = rows.map(row => {
    const isPro = row.business.subscriptionPlan === "pro" && row.business.proValidUntil && new Date(row.business.proValidUntil) > new Date();
    const daysSinceCreated = (new Date().getTime() - new Date(row.business.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const trialExpired = !isPro && (row.leadCount >= 25 || daysSinceCreated >= 90);
    
    const b = { ...row.business };
    if (trialExpired) {
      b.phone = "";
      b.whatsapp = "";
    }
    return { ...row, business: b, trialExpired };
  });

  res.json(enrichedRows);
});

router.get("/businesses/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const rows = await db
    .select({
      business: businessesTable,
      society: societiesTable,
      avgRating: sql<number>`COALESCE(AVG(${reviewsTable.rating}), 0)`,
      reviewCount: sql<number>`COUNT(DISTINCT ${reviewsTable.id})`,
      leadCount: sql<number>`COUNT(DISTINCT ${leadsTable.id})`,
    })
    .from(businessesTable)
    .leftJoin(societiesTable, eq(businessesTable.societyId, societiesTable.id))
    .leftJoin(reviewsTable, eq(reviewsTable.businessId, businessesTable.id))
    .leftJoin(leadsTable, eq(leadsTable.businessId, businessesTable.id))
    .where(and(eq(businessesTable.id, id), eq(businessesTable.status, "approved")))
    .groupBy(businessesTable.id, societiesTable.id)
    .limit(1);

  if (!rows.length) {
    res.status(404).json({ error: "Business not found" });
    return;
  }
  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.businessId, id))
    .orderBy(desc(reviewsTable.createdAt));

  // Fetch active daily deal for buyers: startsAt <= now < expiresAt
  const now = new Date();
  const activeDeals = await db
    .select()
    .from(dailyDealsTable)
    .where(
      and(
        eq(dailyDealsTable.businessId, id),
        lte(dailyDealsTable.startsAt, now),
        gt(dailyDealsTable.expiresAt, now)
      )
    )
    .limit(1);
  const activeDeal = activeDeals[0] || null;

  const row = rows[0];
  const isPro = row.business.subscriptionPlan === "pro" && row.business.proValidUntil && new Date(row.business.proValidUntil) > new Date();
  const daysSinceCreated = (new Date().getTime() - new Date(row.business.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const trialExpired = !isPro && (row.leadCount >= 25 || daysSinceCreated >= 90);
  
  const b = { ...row.business };
  if (trialExpired) {
    b.phone = "";
    b.whatsapp = "";
  }

  res.json({ ...row, business: b, trialExpired, reviews, activeDeal });
});

import { insertBusinessSchema } from "@workspace/db/schema";
import { ZodError } from "zod";

router.post("/businesses", requireAuth, async (req: Request, res: Response, next) => {
  const { userId } = req as AuthedRequest;
  
  try {
    const parsed = insertBusinessSchema.parse({
      ...req.body,
      societyId: Number(req.body.societyId),
      yearsInBusiness: req.body.yearsInBusiness ? Number(req.body.yearsInBusiness) : undefined,
    });

    const [business] = await db
      .insert(businessesTable)
      .values({
        clerkUserId: userId,
        status: "pending",
        ...parsed,
      } as any)
      .returning();

    res.status(201).json(business);
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    next(err);
  }
});

router.put("/businesses/:id", requireAuth, async (req: Request, res: Response, next) => {
  const id = Number(req.params.id);
  const { userId } = req as AuthedRequest;

  try {
    const parsed = insertBusinessSchema.parse({
      ...req.body,
      societyId: Number(req.body.societyId),
      yearsInBusiness: req.body.yearsInBusiness ? Number(req.body.yearsInBusiness) : undefined,
    });

    const [existing] = await db
      .select()
      .from(businessesTable)
      .where(and(eq(businessesTable.id, id), eq(businessesTable.clerkUserId, userId)))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Business not found or not authorized" });
      return;
    }

    const newStatus = (existing.status === "approved" || existing.status === "rejected") ? "pending" : existing.status;

    const [updated] = await db
      .update(businessesTable)
      .set({
        ...parsed,
        status: newStatus,
        imageUrl: parsed.imageUrl || existing.imageUrl,
        rejectionReason: newStatus === "pending" ? null : existing.rejectionReason,
      } as any)
      .where(eq(businessesTable.id, id))
      .returning();

    res.json(updated);
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    next(err);
  }
});

router.patch("/businesses/:id/pause", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const id = Number(req.params.id);
  const [biz] = await db
    .select()
    .from(businessesTable)
    .where(and(eq(businessesTable.id, id), eq(businessesTable.clerkUserId, userId)))
    .limit(1);
  if (!biz) {
    res.status(404).json({ error: "Not found or not authorized" });
    return;
  }
  const [updated] = await db
    .update(businessesTable)
    .set({ status: "paused" })
    .where(eq(businessesTable.id, id))
    .returning();
  res.json(updated);
});

router.patch("/businesses/:id/unpause", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const id = Number(req.params.id);
  const [biz] = await db
    .select()
    .from(businessesTable)
    .where(and(eq(businessesTable.id, id), eq(businessesTable.clerkUserId, userId)))
    .limit(1);
  if (!biz) {
    res.status(404).json({ error: "Not found or not authorized" });
    return;
  }
  const [updated] = await db
    .update(businessesTable)
    .set({ status: "pending" })
    .where(eq(businessesTable.id, id))
    .returning();
  res.json(updated);
});

router.get("/my-businesses", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const rows = await db
    .select({
      business: businessesTable,
      society: societiesTable,
      avgRating: sql<number>`COALESCE(AVG(${reviewsTable.rating}), 0)`,
      reviewCount: sql<number>`COUNT(DISTINCT ${reviewsTable.id})`,
      leadCount: sql<number>`COUNT(DISTINCT ${leadsTable.id})`,
    })
    .from(businessesTable)
    .leftJoin(societiesTable, eq(businessesTable.societyId, societiesTable.id))
    .leftJoin(reviewsTable, eq(reviewsTable.businessId, businessesTable.id))
    .leftJoin(leadsTable, eq(leadsTable.businessId, businessesTable.id))
    .where(eq(businessesTable.clerkUserId, userId))
    .groupBy(businessesTable.id, societiesTable.id)
    .orderBy(desc(businessesTable.createdAt));

  const enrichedRows = await Promise.all(rows.map(async (row) => {
    const isPro = row.business.subscriptionPlan === "pro" && row.business.proValidUntil && new Date(row.business.proValidUntil) > new Date();
    const daysSinceCreated = (new Date().getTime() - new Date(row.business.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const trialExpired = !isPro && (row.leadCount >= 25 || daysSinceCreated >= 90);
    const daysRemaining = Math.max(0, 90 - Math.floor(daysSinceCreated));
    
    // Fetch any non-expired deal for the seller (includes scheduled + active)
    const sellerNow = new Date();
    const activeDeals = await db
      .select()
      .from(dailyDealsTable)
      .where(
        and(
          eq(dailyDealsTable.businessId, row.business.id),
          gt(dailyDealsTable.expiresAt, sellerNow)
        )
      )
      .orderBy(desc(dailyDealsTable.startsAt))
      .limit(1);
    const activeDeal = activeDeals[0] || null;

    return { ...row, trialExpired, daysRemaining, activeDeal };
  }));

  res.json(enrichedRows);
});

router.get("/my-businesses/:id", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const id = Number(req.params.id);
  const rows = await db
    .select({
      business: businessesTable,
      society: societiesTable,
    })
    .from(businessesTable)
    .leftJoin(societiesTable, eq(businessesTable.societyId, societiesTable.id))
    .where(and(eq(businessesTable.id, id), eq(businessesTable.clerkUserId, userId)))
    .limit(1);

  if (!rows.length) {
    res.status(404).json({ error: "Business not found or not authorized" });
    return;
  }
  res.json(rows[0]);
});

export default router;
