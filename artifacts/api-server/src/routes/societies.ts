import { Router } from "express";
import { db } from "@workspace/db";
import { societiesTable } from "@workspace/db";

const router = Router();

router.get("/societies", async (req, res) => {
  const societies = await db.select().from(societiesTable).orderBy(societiesTable.name);
  res.json(societies);
});

export default router;
