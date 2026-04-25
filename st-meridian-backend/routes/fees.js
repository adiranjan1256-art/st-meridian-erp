// routes/fees.js
// GET  /api/fees                 → fee structure for logged-in student
// GET  /api/fees/history         → payment history
// POST /api/fees/payment         → submit a new payment record

import { Router } from "express";
import { db, auth } from "../config/firebase.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Helper
async function getAdmNo(uid) {
  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) throw Object.assign(new Error("User profile not found."), { status: 404 });
  return snap.data().admNo;
}

// ── GET /api/fees ────────────────────────────────────────────────────
router.get("/", requireAuth, async (req, res) => {
  try {
    const admNo = await getAdmNo(req.user.uid);
    const snap  = await db.collection("students").doc(admNo).collection("fees").get();
    res.json({ fees: snap.docs.map(d => d.data()) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ── GET /api/fees/history ────────────────────────────────────────────
router.get("/history", requireAuth, async (req, res) => {
  try {
    const admNo = await getAdmNo(req.user.uid);
    const snap  = await db
      .collection("students").doc(admNo)
      .collection("paymentHistory")
      .orderBy("createdAt", "desc")
      .get();
    res.json({ history: snap.docs.map(d => d.data()) });
  } catch (err) {
    // If no index yet, fall back to unordered
    const admNo = await getAdmNo(req.user.uid).catch(() => null);
    if (!admNo) return res.status(err.status || 500).json({ error: err.message });
    const snap2 = await db.collection("students").doc(admNo).collection("paymentHistory").get();
    res.json({ history: snap2.docs.map(d => d.data()) });
  }
});

// ── POST /api/fees/payment ───────────────────────────────────────────
// Body: { desc, amount, method, txn }
router.post("/payment", requireAuth, async (req, res) => {
  try {
    const { desc, amount, method, txn } = req.body;

    // Basic validation
    if (!desc || !amount || !method || !txn) {
      return res.status(400).json({ error: "desc, amount, method, and txn are required." });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "amount must be a positive number." });
    }

    const admNo    = await getAdmNo(req.user.uid);
    const today    = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const newEntry = {
      date:      today,
      desc,
      amount:    parsedAmount,
      method,
      txn,
      status:    "Pending",
      createdAt: new Date().toISOString(),
      uid:       req.user.uid,
    };

    const docRef = await db
      .collection("students").doc(admNo)
      .collection("paymentHistory")
      .add(newEntry);

    res.status(201).json({ message: "Payment submitted successfully.", id: docRef.id, entry: newEntry });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;
