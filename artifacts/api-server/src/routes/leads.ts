import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable, businessesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { getAuth as clerkGetAuth } from "@clerk/express";

const router = Router();

router.post("/leads", async (req: Request, res: Response) => {
  const { businessId, source } = req.body;
  if (!businessId) {
    res.status(400).json({ error: "businessId is required" });
    return;
  }

  const auth = clerkGetAuth(req);
  const clerkUserId = auth?.userId ?? null;

  const [business] = await db
    .select({ id: businessesTable.id })
    .from(businessesTable)
    .where(eq(businessesTable.id, Number(businessId)))
    .limit(1);

  if (!business) {
    res.status(404).json({ error: "Business not found" });
    return;
  }

  const [lead] = await db
    .insert(leadsTable)
    .values({ businessId: Number(businessId), clerkUserId, source: source || "whatsapp" })
    .returning();

  res.status(201).json(lead);
});

export default router;
