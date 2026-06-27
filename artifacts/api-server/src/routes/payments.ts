import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, businessesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import type { AuthedRequest } from "../middlewares/requireAuth";
import type { Request, Response } from "express";
import { eq, and } from "drizzle-orm";

const router = Router();

router.post("/payments", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { businessId, utrNumber } = req.body;

  if (!businessId || !utrNumber) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  // Verify business belongs to user
  const [biz] = await db
    .select()
    .from(businessesTable)
    .where(and(eq(businessesTable.id, Number(businessId)), eq(businessesTable.clerkUserId, userId)))
    .limit(1);

  if (!biz) {
    res.status(404).json({ error: "Business not found or not authorized" });
    return;
  }

  const [payment] = await db
    .insert(paymentsTable)
    .values({
      businessId: biz.id,
      utrNumber,
      amount: 199, // Hardcoded as per requirement
      status: "pending",
    })
    .returning();

  res.status(201).json(payment);
});

export default router;
