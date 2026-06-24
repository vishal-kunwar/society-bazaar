import { Router } from "express";
import { db } from "@workspace/db";
import { businessesTable, societiesTable, reviewsTable, leadsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import type { AuthedRequest } from "../middlewares/requireAuth";
import type { Request, Response } from "express";

const router = Router();

router.get("/businesses", async (req: Request, res: Response) => {
  const { societyId, category, status } = req.query;
  const approvedStatus = (status as string) || "approved";

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
        eq(businessesTable.status, approvedStatus as "approved" | "pending" | "rejected" | "paused"),
        societyId ? eq(businessesTable.societyId, Number(societyId)) : undefined,
        category ? eq(businessesTable.category, category as string) : undefined,
      ),
    )
    .groupBy(businessesTable.id, societiesTable.id)
    .orderBy(desc(businessesTable.createdAt));

  res.json(rows);
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
    .where(eq(businessesTable.id, id))
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

  res.json({ ...rows[0], reviews });
});

router.post("/businesses", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { businessName, ownerName, societyId, category, phone, whatsapp, description } = req.body;

  if (!businessName || !ownerName || !societyId || !category || !phone || !whatsapp || !description) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  const [business] = await db
    .insert(businessesTable)
    .values({
      clerkUserId: userId,
      businessName,
      ownerName,
      societyId: Number(societyId),
      category,
      phone,
      whatsapp,
      description,
      status: "pending",
    })
    .returning();

  res.status(201).json(business);
});

router.put("/businesses/:id", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const id = Number(req.params.id);
  const { businessName, ownerName, societyId, category, phone, whatsapp, description } = req.body;

  const [existing] = await db
    .select()
    .from(businessesTable)
    .where(and(eq(businessesTable.id, id), eq(businessesTable.clerkUserId, userId)))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Business not found or not authorized" });
    return;
  }

  const [updated] = await db
    .update(businessesTable)
    .set({ businessName, ownerName, societyId: Number(societyId), category, phone, whatsapp, description })
    .where(eq(businessesTable.id, id))
    .returning();

  res.json(updated);
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
  res.json(rows);
});

export default router;
