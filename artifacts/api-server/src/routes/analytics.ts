import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable, reviewsTable, businessesTable } from "@workspace/db";
import { eq, sql, and, gte, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import type { AuthedRequest } from "../middlewares/requireAuth";
import type { Request, Response } from "express";

const router = Router();

router.get("/analytics/seller", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const businesses = await db
    .select({ id: businessesTable.id, createdAt: businessesTable.createdAt })
    .from(businessesTable)
    .where(eq(businessesTable.clerkUserId, userId));

  if (!businesses.length) {
    res.json({ leadsThisMonth: 0, totalLeads: 0, avgRating: 0, reviewCount: 0, repeatLeads: 0 });
    return;
  }

  const bizIds = businesses.map(b => b.id);

  const [leadsThisMonthRow] = await db
    .select({ count: count() })
    .from(leadsTable)
    .where(
      and(
        sql`${leadsTable.businessId} = ANY(${sql.raw(`ARRAY[${bizIds.join(",")}]`)})`,
        sql`${leadsTable.source} != 'repeat'`,
        gte(leadsTable.createdAt, monthStart),
      ),
    );

  const [totalLeadsRow] = await db
    .select({ count: count() })
    .from(leadsTable)
    .where(
      and(
        sql`${leadsTable.businessId} = ANY(${sql.raw(`ARRAY[${bizIds.join(",")}]`)})`,
        sql`${leadsTable.source} != 'repeat'`
      )
    );

  const [repeatLeadsRow] = await db
    .select({ count: count() })
    .from(leadsTable)
    .where(
      and(
        sql`${leadsTable.businessId} = ANY(${sql.raw(`ARRAY[${bizIds.join(",")}]`)})`,
        eq(leadsTable.source, "repeat"),
      ),
    );

  const [totalClicksRow] = await db
    .select({ count: count() })
    .from(leadsTable)
    .where(sql`${leadsTable.businessId} = ANY(${sql.raw(`ARRAY[${bizIds.join(",")}]`)})`);

  const [ratingsRow] = await db
    .select({
      avg: sql<number>`COALESCE(AVG(${reviewsTable.rating}), 0)`,
      cnt: count(),
    })
    .from(reviewsTable)
    .where(sql`${reviewsTable.businessId} = ANY(${sql.raw(`ARRAY[${bizIds.join(",")}]`)})`);

  res.json({
    leadsThisMonth: Number(leadsThisMonthRow?.count ?? 0),
    totalLeads: Number(totalLeadsRow?.count ?? 0),
    repeatLeads: Number(repeatLeadsRow?.count ?? 0),
    totalClicks: Number(totalClicksRow?.count ?? 0),
    avgRating: Number(ratingsRow?.avg ?? 0),
    reviewCount: Number(ratingsRow?.cnt ?? 0),
    subscriptionStartDate: businesses.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]?.createdAt,
  });
});

export default router;
