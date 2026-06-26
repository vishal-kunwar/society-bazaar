import { Router } from "express";
import { db } from "@workspace/db";
import { businessesTable, societiesTable, reviewsTable, leadsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import type { AuthedRequest } from "../middlewares/requireAuth";
import type { Request, Response } from "express";

const router = Router();

router.get("/businesses", async (req: Request, res: Response) => {
  const { societyId, category } = req.query;

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
        category ? sql`${businessesTable.category} = ${category}` : undefined,
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

  res.json({ ...rows[0], reviews });
});

router.post("/businesses", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const {
    businessName, ownerName, societyId, category, phone, whatsapp, description,
    email, yearsInBusiness, tower, flatNumber, city, alternatePhone,
    instagram, website, priceRange, servicesOffered, imageUrl, coverImageUrl,
  } = req.body;

  if (!businessName || !ownerName || !societyId || !category || !phone || !whatsapp || !description) {
    res.status(400).json({ error: "Required fields missing" });
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
      imageUrl: imageUrl || "",
      status: "pending",
      email: email || null,
      yearsInBusiness: yearsInBusiness ? Number(yearsInBusiness) : null,
      tower: tower || null,
      flatNumber: flatNumber || null,
      city: city || null,
      alternatePhone: alternatePhone || null,
      instagram: instagram || null,
      website: website || null,
      priceRange: priceRange || null,
      servicesOffered: servicesOffered || null,
      coverImageUrl: coverImageUrl || null,
    })
    .returning();

  res.status(201).json(business);
});

router.put("/businesses/:id", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const id = Number(req.params.id);
  const {
    businessName, ownerName, societyId, category, phone, whatsapp, description,
    email, yearsInBusiness, tower, flatNumber, city, alternatePhone,
    instagram, website, priceRange, servicesOffered, imageUrl, coverImageUrl,
  } = req.body;

  const [existing] = await db
    .select()
    .from(businessesTable)
    .where(and(eq(businessesTable.id, id), eq(businessesTable.clerkUserId, userId)))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Business not found or not authorized" });
    return;
  }

  // If the listing was approved, reset to pending so admin can re-review changes
  const newStatus = existing.status === "approved" ? "pending" : existing.status;

  const [updated] = await db
    .update(businessesTable)
    .set({
      businessName,
      ownerName,
      societyId: Number(societyId),
      category,
      phone,
      whatsapp,
      description,
      status: newStatus,
      email: email || null,
      yearsInBusiness: yearsInBusiness ? Number(yearsInBusiness) : null,
      tower: tower || null,
      flatNumber: flatNumber || null,
      city: city || null,
      alternatePhone: alternatePhone || null,
      instagram: instagram || null,
      website: website || null,
      priceRange: priceRange || null,
      servicesOffered: servicesOffered || null,
      imageUrl: imageUrl || existing.imageUrl,
      coverImageUrl: coverImageUrl || null,
    })
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
