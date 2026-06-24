import { Router } from "express";
import { db } from "@workspace/db";
import { dailyDealsTable, businessesTable, societiesTable } from "@workspace/db";
import { eq, desc, gt, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import type { AuthedRequest } from "../middlewares/requireAuth";
import type { Request, Response } from "express";

const router = Router();

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
        gt(dailyDealsTable.expiresAt, now),
      ),
    )
    .orderBy(desc(dailyDealsTable.createdAt))
    .limit(10);
  res.json(rows);
});

router.post("/deals", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { businessId, title, description, expiresAt } = req.body;
  if (!businessId || !title || !description || !expiresAt) {
    res.status(400).json({ error: "businessId, title, description, and expiresAt required" });
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
  const [deal] = await db
    .insert(dailyDealsTable)
    .values({
      businessId: Number(businessId),
      clerkUserId: userId,
      title,
      description,
      expiresAt: new Date(expiresAt),
    })
    .returning();
  res.status(201).json(deal);
});

export default router;
