import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable, businessesTable } from "@workspace/db";
import { eq, and, gte, isNull, sql } from "drizzle-orm";
import type { Request, Response } from "express";
import { getAuth as clerkGetAuth } from "@clerk/express";

const router = Router();

function getClientIp(req: Request): string | null {
  const xff = req.headers["x-forwarded-for"];
  const raw = Array.isArray(xff) ? xff[0] : xff;
  const ip = raw?.split(",")[0]?.trim() || req.socket?.remoteAddress;
  return ip || null;
}

router.post("/leads", async (req: Request, res: Response) => {
  const { businessId, source } = req.body;
  if (!businessId) {
    res.status(400).json({ error: "businessId is required" });
    return;
  }

  const auth = clerkGetAuth(req);
  const clerkUserId = auth?.userId ?? null;
  const leadSource = source || "whatsapp";

  const [business] = await db
    .select({ id: businessesTable.id, status: businessesTable.status })
    .from(businessesTable)
    .where(eq(businessesTable.id, Number(businessId)))
    .limit(1);

  if (!business) {
    res.status(404).json({ error: "Business not found" });
    return;
  }
  if (business.status !== "approved") {
    res.status(404).json({ error: "Business not found" });
    return;
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const clientIp = getClientIp(req);
  let existingUniqueLead = null;

  if (clerkUserId) {
    const [existing] = await db
      .select()
      .from(leadsTable)
      .where(
        and(
          eq(leadsTable.businessId, Number(businessId)),
          eq(leadsTable.clerkUserId, clerkUserId),
          sql`${leadsTable.source} != 'repeat'`,
          gte(leadsTable.createdAt, thirtyDaysAgo),
        ),
      )
      .limit(1);
    existingUniqueLead = existing || null;
  } else if (clientIp) {
    const [existing] = await db
      .select()
      .from(leadsTable)
      .where(
        and(
          eq(leadsTable.businessId, Number(businessId)),
          isNull(leadsTable.clerkUserId),
          eq(leadsTable.ipAddress, clientIp),
          sql`${leadsTable.source} != 'repeat'`,
          gte(leadsTable.createdAt, thirtyDaysAgo),
        ),
      )
      .limit(1);
    existingUniqueLead = existing || null;
  }

  const finalSource = existingUniqueLead ? "repeat" : leadSource;

  const [lead] = await db
    .insert(leadsTable)
    .values({
      businessId: Number(businessId),
      clerkUserId,
      ipAddress: clerkUserId ? null : clientIp,
      source: finalSource,
    })
    .returning();

  res.status(201).json(lead);
});

export default router;
