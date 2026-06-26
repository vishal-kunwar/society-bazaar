import { Router } from "express";
import { db } from "@workspace/db";
import { societiesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/societies", async (req, res) => {
  const societies = await db.select().from(societiesTable).orderBy(societiesTable.name);
  res.json(societies);
});

router.post("/societies/find-or-create", async (req, res) => {
  const { name, city = "" } = req.body as { name?: string; city?: string };
  if (!name || !name.trim()) {
    res.status(400).json({ error: "Society name is required" });
    return;
  }

  const trimmedName = name.trim();

  const existing = await db
    .select()
    .from(societiesTable)
    .where(sql`lower(${societiesTable.name}) = lower(${trimmedName})`)
    .limit(1);

  if (existing.length > 0) {
    res.json(existing[0]);
    return;
  }

  const [created] = await db
    .insert(societiesTable)
    .values({ name: trimmedName, city: city.trim() })
    .returning();

  res.status(201).json(created);
});

export default router;
