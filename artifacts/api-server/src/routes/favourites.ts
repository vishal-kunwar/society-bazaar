import { Router } from "express";
import { db } from "@workspace/db";
import { favouritesTable, businessesTable, societiesTable, reviewsTable, leadsTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import type { AuthedRequest } from "../middlewares/requireAuth";
import type { Request, Response } from "express";

const router = Router();

router.get("/favourites", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const rows = await db
    .select({
      fav: favouritesTable,
      business: businessesTable,
      society: societiesTable,
      avgRating: sql<number>`COALESCE(AVG(${reviewsTable.rating}), 0)`,
      reviewCount: sql<number>`COUNT(DISTINCT ${reviewsTable.id})`,
      leadCount: sql<number>`COUNT(DISTINCT ${leadsTable.id})`,
    })
    .from(favouritesTable)
    .innerJoin(businessesTable, eq(favouritesTable.businessId, businessesTable.id))
    .leftJoin(societiesTable, eq(businessesTable.societyId, societiesTable.id))
    .leftJoin(reviewsTable, eq(reviewsTable.businessId, businessesTable.id))
    .leftJoin(leadsTable, eq(leadsTable.businessId, businessesTable.id))
    .where(eq(favouritesTable.clerkUserId, userId))
    .groupBy(favouritesTable.id, businessesTable.id, societiesTable.id);
  res.json(rows);
});

router.post("/favourites/toggle", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { businessId } = req.body;
  if (!businessId) {
    res.status(400).json({ error: "businessId required" });
    return;
  }
  const [existing] = await db
    .select()
    .from(favouritesTable)
    .where(and(eq(favouritesTable.clerkUserId, userId), eq(favouritesTable.businessId, Number(businessId))))
    .limit(1);

  if (existing) {
    await db.delete(favouritesTable).where(eq(favouritesTable.id, existing.id));
    res.json({ saved: false });
  } else {
    await db.insert(favouritesTable).values({ clerkUserId: userId, businessId: Number(businessId) });
    res.json({ saved: true });
  }
});

router.get("/favourites/ids", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const rows = await db
    .select({ businessId: favouritesTable.businessId })
    .from(favouritesTable)
    .where(eq(favouritesTable.clerkUserId, userId));
  res.json(rows.map(r => r.businessId));
});

export default router;
