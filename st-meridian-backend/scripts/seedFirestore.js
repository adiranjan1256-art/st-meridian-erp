// scripts/seedFirestore.js
// Run once to populate Firestore with all initial data:
//   node scripts/seedFirestore.js
//
// Safe to re-run — uses set() with merge so it won't duplicate.

import { db } from "../config/firebase.js";
import {
  seedStudent, seedNotices, seedFees, seedPaymentHistory,
  seedTimetable, seedResults, seedAttendance, seedBusRoutes,
  seedTimeline, seedFacilities, seedLeadership,
} from "../data/seed.js";

async function seed() {
  console.log("🌱  Seeding Firestore …\n");

  // ── school-wide static collections ──────────────────────────────
  const batch = db.batch();

  // notices
  for (const n of seedNotices) {
    batch.set(db.collection("notices").doc(n.id), n, { merge: true });
  }
  console.log(`  ✔ ${seedNotices.length} notices`);

  // bus routes
  for (const r of seedBusRoutes) {
    batch.set(db.collection("busRoutes").doc(r.no), r, { merge: true });
  }
  console.log(`  ✔ ${seedBusRoutes.length} bus routes`);

  // timeline
  for (const t of seedTimeline) {
    batch.set(db.collection("timeline").doc(t.year), t, { merge: true });
  }
  console.log(`  ✔ ${seedTimeline.length} timeline entries`);

  // facilities
  for (const [i, f] of seedFacilities.entries()) {
    batch.set(db.collection("facilities").doc(String(i)), f, { merge: true });
  }
  console.log(`  ✔ ${seedFacilities.length} facilities`);

  // leadership
  for (const [i, l] of seedLeadership.entries()) {
    batch.set(db.collection("leadership").doc(String(i)), l, { merge: true });
  }
  console.log(`  ✔ ${seedLeadership.length} leadership entries`);

  await batch.commit();

  // ── student-specific data (stored under /students/{admNo}/*) ────
  const admNo   = seedStudent.admNo;
  const stuRef  = db.collection("students").doc(admNo);

  await stuRef.set(seedStudent, { merge: true });
  console.log(`  ✔ student profile  (${admNo})`);

  // sub-collections
  const batch2 = db.batch();
  for (const [i, f] of seedFees.entries()) {
    batch2.set(stuRef.collection("fees").doc(String(i)), f, { merge: true });
  }
  for (const [i, p] of seedPaymentHistory.entries()) {
    batch2.set(stuRef.collection("paymentHistory").doc(String(i)), p, { merge: true });
  }
  for (const [i, t] of seedTimetable.entries()) {
    batch2.set(stuRef.collection("timetable").doc(String(i)), t, { merge: true });
  }
  for (const [i, r] of seedResults.entries()) {
    batch2.set(stuRef.collection("results").doc(String(i)), r, { merge: true });
  }
  for (const [i, a] of seedAttendance.entries()) {
    batch2.set(stuRef.collection("attendance").doc(String(i)), a, { merge: true });
  }
  await batch2.commit();

  console.log("  ✔ fees, paymentHistory, timetable, results, attendance\n");
  console.log("✅  Seed complete!\n");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
