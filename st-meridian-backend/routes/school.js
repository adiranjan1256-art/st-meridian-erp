// routes/school.js
// GET /api/school/info        → full about/history payload (timeline + facilities + leadership)
// GET /api/school/timeline    → timeline only
// GET /api/school/facilities  → facilities only
// GET /api/school/leadership  → leadership only

import { Router } from "express";
import { db } from "../config/firebase.js";

const router = Router();

async function getCollection(name) {
  const snap = await db.collection(name).get();
  return snap.docs.map(d => d.data());
}

// ── GET /api/school/info ─────────────────────────────────────────────
router.get("/info", async (_req, res) => {
  try {
    const [timeline, facilities, leadership] = await Promise.all([
      getCollection("timeline"),
      getCollection("facilities"),
      getCollection("leadership"),
    ]);
    // Sort timeline by year
    timeline.sort((a, b) => Number(a.year) - Number(b.year));
    res.json({ timeline, facilities, leadership });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/school/timeline ─────────────────────────────────────────
router.get("/timeline", async (_req, res) => {
  try {
    const timeline = await getCollection("timeline");
    timeline.sort((a, b) => Number(a.year) - Number(b.year));
    res.json({ timeline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/school/facilities ───────────────────────────────────────
router.get("/facilities", async (_req, res) => {
  try {
    res.json({ facilities: await getCollection("facilities") });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/school/leadership ───────────────────────────────────────
router.get("/leadership", async (_req, res) => {
  try {
    res.json({ leadership: await getCollection("leadership") });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
