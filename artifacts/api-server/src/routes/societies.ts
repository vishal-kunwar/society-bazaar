import { Router } from "express";
import { db } from "@workspace/db";
import { societiesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/societies", async (req, res) => {
  const { city, locality } = req.query;
  
  let query = db.select().from(societiesTable).$dynamic();
  
  const conditions = [];
  if (city) conditions.push(sql`lower(${societiesTable.city}) = lower(${city as string})`);
  if (locality) conditions.push(sql`lower(${societiesTable.locality}) = lower(${locality as string})`);
  
  if (conditions.length > 0) {
    query = query.where(sql.join(conditions, sql` AND `));
  }
  
  const societies = await query.orderBy(societiesTable.name);
  res.json(societies);
});

router.post("/societies/find-or-create", async (req, res) => {
  const { name, city = "", locality = "" } = req.body as { name?: string; city?: string; locality?: string };
  if (!name || !name.trim()) {
    res.status(400).json({ error: "Society name is required" });
    return;
  }
  if (!city || !city.trim()) {
    res.status(400).json({ error: "City is required" });
    return;
  }
  if (!locality || !locality.trim()) {
    res.status(400).json({ error: "Locality is required" });
    return;
  }

  const trimmedName = name.trim();
  const trimmedCity = city.trim();
  const trimmedLocality = locality.trim();

  const existing = await db
    .select()
    .from(societiesTable)
    .where(
      sql`lower(${societiesTable.name}) = lower(${trimmedName}) AND lower(${societiesTable.city}) = lower(${trimmedCity}) AND lower(${societiesTable.locality}) = lower(${trimmedLocality})`
    )
    .limit(1);

  if (existing.length > 0) {
    res.json(existing[0]);
    return;
  }

  const [created] = await db
    .insert(societiesTable)
    .values({ name: trimmedName, city: trimmedCity, locality: trimmedLocality })
    .returning();

  res.status(201).json(created);
});

export default router;
