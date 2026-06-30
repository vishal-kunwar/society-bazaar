import { Router } from "express";
import { db } from "@workspace/db";
import { feedPostsTable, businessesTable, societiesTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import type { AuthedRequest } from "../middlewares/requireAuth";
import type { Request, Response } from "express";

const router = Router();

router.get("/feed", async (req: Request, res: Response) => {
  const { societyId, city, limit, offset } = req.query;
  const parsedLimit = limit ? Math.min(Number(limit), 100) : 20;
  const parsedOffset = offset ? Number(offset) : 0;

  const rows = await db
    .select({ post: feedPostsTable, business: businessesTable, society: societiesTable })
    .from(feedPostsTable)
    .innerJoin(businessesTable, eq(feedPostsTable.businessId, businessesTable.id))
    .leftJoin(societiesTable, eq(businessesTable.societyId, societiesTable.id))
    .where(
      and(
        eq(businessesTable.status, "approved"),
        societyId ? eq(businessesTable.societyId, Number(societyId)) : undefined,
        city ? sql`lower(${societiesTable.city}) = lower(${city as string})` : undefined,
        sql`
          (
            NOT (${feedPostsTable.title} LIKE '🔥 New Daily Deal:%')
            OR
            EXISTS (
              SELECT 1 FROM daily_deals
              WHERE daily_deals.business_id = ${feedPostsTable.businessId}
                AND ('🔥 New Daily Deal: ' || daily_deals.title) = ${feedPostsTable.title}
                AND daily_deals.starts_at <= NOW()
                AND daily_deals.expires_at > NOW()
            )
          )
        `
      ),
    )
    .orderBy(desc(feedPostsTable.createdAt))
    .limit(parsedLimit)
    .offset(parsedOffset);
  res.json(rows);
});

router.post("/feed", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { businessId, title, body, imageUrl } = req.body;
  if (!businessId || !title || !body) {
    res.status(400).json({ error: "businessId, title and body required" });
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
  const [post] = await db
    .insert(feedPostsTable)
    .values({ businessId: Number(businessId), clerkUserId: userId, title, body, imageUrl: imageUrl || "" })
    .returning();
  res.status(201).json(post);
});

export default router;
