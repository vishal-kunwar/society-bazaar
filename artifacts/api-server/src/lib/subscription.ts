import { db } from "@workspace/db";
import { businessesTable, leadsTable } from "@workspace/db";
import { eq, sql, inArray } from "drizzle-orm";

export interface SellerSubscriptionStatus {
  isPro: boolean;
  proValidUntil: Date | null;
  daysSinceCreated: number;
  daysUsed: number;
  daysRemaining: number;
  totalLeads: number;
  trialExpired: boolean;
}

export async function getSellerSubscriptionStatus(clerkUserId: string): Promise<SellerSubscriptionStatus> {
  // 1. Fetch all businesses of this seller
  const businesses = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.clerkUserId, clerkUserId));

  if (businesses.length === 0) {
    return {
      isPro: false,
      proValidUntil: null,
      daysSinceCreated: 0,
      daysUsed: 0,
      daysRemaining: 90,
      totalLeads: 0,
      trialExpired: false,
    };
  }

  // 2. Determine if Pro (any business is active pro)
  const now = new Date();
  let isPro = false;
  let latestProValidUntil: Date | null = null;

  for (const biz of businesses) {
    if (biz.subscriptionPlan === "pro" && biz.proValidUntil) {
      const validUntil = new Date(biz.proValidUntil);
      if (validUntil > now) {
        isPro = true;
        if (!latestProValidUntil || validUntil > latestProValidUntil) {
          latestProValidUntil = validUntil;
        }
      }
    }
  }

  // 3. Find the earliest business creation date as trial start
  let earliestCreatedAt = new Date();
  for (const biz of businesses) {
    const created = new Date(biz.createdAt);
    if (created < earliestCreatedAt) {
      earliestCreatedAt = created;
    }
  }

  const daysSinceCreated = (now.getTime() - earliestCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
  const daysUsed = Math.min(90, Math.floor(daysSinceCreated) + 1);
  const daysRemaining = Math.max(0, 90 - daysUsed);

  // 4. Fetch total leads across all businesses of this seller
  const businessIds = businesses.map(b => b.id);
  let totalLeads = 0;
  if (businessIds.length > 0) {
    const leads = await db
      .select({ count: sql<number>`count(*)` })
      .from(leadsTable)
      .where(inArray(leadsTable.businessId, businessIds));
    totalLeads = Number(leads[0]?.count || 0);
  }

  const trialExpired = !isPro && (totalLeads >= 25 || daysSinceCreated >= 90);

  return {
    isPro,
    proValidUntil: latestProValidUntil,
    daysSinceCreated,
    daysUsed,
    daysRemaining,
    totalLeads,
    trialExpired,
  };
}
