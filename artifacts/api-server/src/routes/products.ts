import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, businessesTable } from "@workspace/db";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import type { AuthedRequest } from "../middlewares/requireAuth";
import type { Request, Response } from "express";

const router = Router();

async function getOwnedBusiness(businessId: number, userId: string) {
  const [biz] = await db
    .select()
    .from(businessesTable)
    .where(and(eq(businessesTable.id, businessId), eq(businessesTable.clerkUserId, userId)))
    .limit(1);
  return biz ?? null;
}

async function getOwnedProduct(productId: number, userId: string) {
  const [row] = await db
    .select({ product: productsTable, business: businessesTable })
    .from(productsTable)
    .innerJoin(businessesTable, eq(productsTable.businessId, businessesTable.id))
    .where(and(eq(productsTable.id, productId), eq(businessesTable.clerkUserId, userId)))
    .limit(1);
  return row ?? null;
}

function productSortOrder() {
  return [desc(productsTable.featured), asc(productsTable.displayOrder), desc(productsTable.createdAt)];
}

router.get("/businesses/:businessId/products", async (req: Request, res: Response) => {
  const businessId = Number(req.params.businessId);

  const [business] = await db
    .select({ id: businessesTable.id, status: businessesTable.status })
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId))
    .limit(1);

  if (!business || business.status !== "approved") {
    res.status(404).json({ error: "Business not found" });
    return;
  }

  const products = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.businessId, businessId), eq(productsTable.active, true)))
    .orderBy(...productSortOrder());

  res.json(products);
});

router.get("/businesses/:businessId/products/manage", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const businessId = Number(req.params.businessId);

  const biz = await getOwnedBusiness(businessId, userId);
  if (!biz) {
    res.status(404).json({ error: "Business not found or not authorized" });
    return;
  }

  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.businessId, businessId))
    .orderBy(...productSortOrder());

  res.json(products);
});

router.post("/businesses/:businessId/products", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const businessId = Number(req.params.businessId);
  const { name, description, image, price, category, featured, active } = req.body;

  if (!name?.trim()) {
    res.status(400).json({ error: "Product name is required" });
    return;
  }

  const biz = await getOwnedBusiness(businessId, userId);
  if (!biz) {
    res.status(404).json({ error: "Business not found or not authorized" });
    return;
  }

  const [maxOrder] = await db
    .select({ max: sql<number>`COALESCE(MAX(${productsTable.displayOrder}), -1)` })
    .from(productsTable)
    .where(eq(productsTable.businessId, businessId));

  const [product] = await db
    .insert(productsTable)
    .values({
      businessId,
      name: name.trim(),
      description: description?.trim() || "",
      image: image?.trim() || "",
      price: price?.trim() || "",
      category: category?.trim() || "",
      featured: Boolean(featured),
      active: active !== false,
      displayOrder: Number(maxOrder?.max ?? -1) + 1,
    })
    .returning();

  res.status(201).json(product);
});

router.put("/products/:productId", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const productId = Number(req.params.productId);
  const { name, description, image, price, category, featured, active } = req.body;

  const owned = await getOwnedProduct(productId, userId);
  if (!owned) {
    res.status(404).json({ error: "Product not found or not authorized" });
    return;
  }

  if (name !== undefined && !String(name).trim()) {
    res.status(400).json({ error: "Product name is required" });
    return;
  }

  const [updated] = await db
    .update(productsTable)
    .set({
      ...(name !== undefined && { name: String(name).trim() }),
      ...(description !== undefined && { description: String(description).trim() }),
      ...(image !== undefined && { image: String(image).trim() }),
      ...(price !== undefined && { price: String(price).trim() }),
      ...(category !== undefined && { category: String(category).trim() }),
      ...(featured !== undefined && { featured: Boolean(featured) }),
      ...(active !== undefined && { active: Boolean(active) }),
    })
    .where(eq(productsTable.id, productId))
    .returning();

  res.json(updated);
});

router.delete("/products/:productId", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const productId = Number(req.params.productId);

  const owned = await getOwnedProduct(productId, userId);
  if (!owned) {
    res.status(404).json({ error: "Product not found or not authorized" });
    return;
  }

  await db.delete(productsTable).where(eq(productsTable.id, productId));
  res.status(204).send();
});

router.patch("/businesses/:businessId/products/reorder", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const businessId = Number(req.params.businessId);
  const { productIds } = req.body as { productIds?: number[] };

  if (!Array.isArray(productIds) || productIds.length === 0) {
    res.status(400).json({ error: "productIds array is required" });
    return;
  }

  const biz = await getOwnedBusiness(businessId, userId);
  if (!biz) {
    res.status(404).json({ error: "Business not found or not authorized" });
    return;
  }

  const existing = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(eq(productsTable.businessId, businessId));

  const existingIds = new Set(existing.map(p => p.id));
  if (productIds.length !== existing.length || productIds.some(id => !existingIds.has(Number(id)))) {
    res.status(400).json({ error: "productIds must include all products for this business" });
    return;
  }

  await db.transaction(async (tx) => {
    for (let i = 0; i < productIds.length; i++) {
      await tx
        .update(productsTable)
        .set({ displayOrder: i })
        .where(and(eq(productsTable.id, Number(productIds[i])), eq(productsTable.businessId, businessId)));
    }
  });

  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.businessId, businessId))
    .orderBy(...productSortOrder());

  res.json(products);
});

export default router;
