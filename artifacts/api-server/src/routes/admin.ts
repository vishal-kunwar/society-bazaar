import { Router } from "express";
import { db } from "@workspace/db";
import { businessesTable, societiesTable, leadsTable, reviewsTable, paymentsTable } from "@workspace/db";
import { eq, desc, sql, count } from "drizzle-orm";
import { requireAdmin, isClerkEnabled, ADMIN_USER_IDS } from "../middlewares/requireAuth";
import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";

const router = Router();

router.get("/admin/check", async (req: Request, res: Response) => {
  if (!isClerkEnabled) {
    res.json({ isAdmin: true });
    return;
  }
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.json({ isAdmin: false });
    return;
  }
  const isAdmin = ADMIN_USER_IDS.includes(userId);
  res.json({ isAdmin });
});


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

router.get("/admin/payments", requireAdmin, async (req: Request, res: Response) => {
  const { status } = req.query;
  const rows = await db
    .select({ payment: paymentsTable, business: businessesTable })
    .from(paymentsTable)
    .leftJoin(businessesTable, eq(paymentsTable.businessId, businessesTable.id))
    .where(status ? eq(paymentsTable.status, status as "pending" | "approved" | "rejected") : undefined)
    .orderBy(desc(paymentsTable.createdAt));
  res.json(rows);
});

router.patch("/admin/payments/:id/approve", requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const [payment] = await db
    .update(paymentsTable)
    .set({ status: "approved" })
    .where(eq(paymentsTable.id, id))
    .returning();

  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  const proValidUntil = new Date();
  proValidUntil.setDate(proValidUntil.getDate() + 30);

  await db
    .update(businessesTable)
    .set({ subscriptionPlan: "pro", proValidUntil })
    .where(eq(businessesTable.id, payment.businessId));

  res.json(payment);
});

router.patch("/admin/payments/:id/reject", requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const [payment] = await db
    .update(paymentsTable)
    .set({ status: "rejected" })
    .where(eq(paymentsTable.id, id))
    .returning();

  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  res.json(payment);
});

export default router;
