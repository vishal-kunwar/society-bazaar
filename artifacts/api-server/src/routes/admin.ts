import { Router } from "express";
import { db } from "@workspace/db";
import { businessesTable, societiesTable, leadsTable, reviewsTable, paymentsTable } from "@workspace/db";
import { eq, desc, sql, count } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

if (!ADMIN_PASSWORD || !JWT_SECRET) {
  throw new Error(
    "FATAL: ADMIN_PASSWORD and JWT_SECRET environment variables must be set. " +
    "The server will not start without them."
  );
}

const router = Router();

router.post("/admin/login", async (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    res.json({ success: true });
    return;
  }
  res.status(401).json({ error: "Invalid password" });
});

router.post("/admin/logout", async (req: Request, res: Response) => {
  res.clearCookie("admin_token");
  res.json({ success: true });
});

router.get("/admin/check", async (req: Request, res: Response) => {
  const token = req.cookies.admin_token;
  if (!token) {
    res.json({ isAdmin: false });
    return;
  }
  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ isAdmin: true });
  } catch (err) {
    res.json({ isAdmin: false });
  }
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
  const { status, rejectionReason } = req.body;

  if (!["approved", "rejected", "pending"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  if (status === "rejected" && !rejectionReason?.trim()) {
    res.status(400).json({ error: "Rejection reason is required" });
    return;
  }

  const [updated] = await db
    .update(businessesTable)
    .set({
      status,
      rejectionReason: status === "rejected" ? rejectionReason.trim() : null,
    })
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
