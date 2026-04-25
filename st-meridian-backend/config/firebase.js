// config/firebase.js
// Initialises the Firebase Admin SDK once and exports the app,
// auth, and firestore instances.

import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

let app;

if (!admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Newlines in the private key are stored as literal \n in .env
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
} else {
  app = admin.apps[0];
}

export const auth = admin.auth();
export const db   = admin.firestore();
export default app;
