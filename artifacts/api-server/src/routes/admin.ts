import { Router } from "express";
import { db } from "@workspace/db";
import { businessesTable, societiesTable, leadsTable, reviewsTable } from "@workspace/db";
import { eq, desc, sql, count } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAuth";
import type { Request, Response } from "express";

const router = Router();

router.get("/admin/stats", requireAdmin, async (_req: Request, res: Response) => {
  const [totals] = await db
    .select({
      totalBusinesses: count(businessesTable.id),
    })
    .from(businessesTable);

  const [pendingCount] = await db
    .select({ count: count(businessesTable.id) })
    .from(businessesTable)
    .where(eq(businessesTable.status, "pending"));

  const [approvedCount] = await db
    .select({ count: count(businessesTable.id) })
    .from(businessesTable)
    .where(eq(businessesTable.status, "approved"));

  const [totalLeads] = await db
    .select({ count: count(leadsTable.id) })
    .from(leadsTable);

  const topCategories = await db
    .select({
      category: businessesTable.category,
      count: count(businessesTable.id),
    })
    .from(businessesTable)
    .where(eq(businessesTable.status, "approved"))
    .groupBy(businessesTable.category)
    .orderBy(desc(count(businessesTable.id)))
    .limit(5);

  const topBusinesses = await db
    .select({
      business: businessesTable,
      leadCount: count(leadsTable.id),
    })
    .from(businessesTable)
    .leftJoin(leadsTable, eq(leadsTable.businessId, businessesTable.id))
    .where(eq(businessesTable.status, "approved"))
    .groupBy(businessesTable.id)
    .orderBy(desc(count(leadsTable.id)))
    .limit(5);

  res.json({
    totalBusinesses: totals.totalBusinesses,
    pendingBusinesses: pendingCount.count,
    approvedBusinesses: approvedCount.count,
    totalLeads: totalLeads.count,
    topCategories,
    topBusinesses,
  });
});

router.get("/admin/businesses", requireAdmin, async (req: Request, res: Response) => {
  const { status } = req.query;
  const rows = await db
    .select({ business: businessesTable, society: societiesTable })
    .from(businessesTable)
    .leftJoin(societiesTable, eq(businessesTable.societyId, societiesTable.id))
    .where(status ? eq(businessesTable.status, status as "pending" | "approved" | "rejected") : undefined)
    .orderBy(desc(businessesTable.createdAt));
  res.json(rows);
});

router.patch("/admin/businesses/:id/status", requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!["approved", "rejected", "pending"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [updated] = await db
    .update(businessesTable)
    .set({ status })
    .where(eq(businessesTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Business not found" });
    return;
  }

  res.json(updated);
});

export default router;
