import { Router } from "express";
import { db } from "@workspace/db";
import { feedPostsTable, businessesTable, societiesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import type { AuthedRequest } from "../middlewares/requireAuth";
import type { Request, Response } from "express";

const router = Router();

router.get("/feed", async (req: Request, res: Response) => {
  const { societyId } = req.query;
  const rows = await db
    .select({ post: feedPostsTable, business: businessesTable, society: societiesTable })
    .from(feedPostsTable)
    .innerJoin(businessesTable, eq(feedPostsTable.businessId, businessesTable.id))
    .leftJoin(societiesTable, eq(businessesTable.societyId, societiesTable.id))
    .where(
      and(
        eq(businessesTable.status, "approved"),
        societyId ? eq(businessesTable.societyId, Number(societyId)) : undefined,
      ),
    )
    .orderBy(desc(feedPostsTable.createdAt))
    .limit(20);
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
