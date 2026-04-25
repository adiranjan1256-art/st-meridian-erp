// firebase.js  (frontend — keep this in your HTML project folder)
// ─────────────────────────────────────────────────────────────
// Replace the placeholder values below with your actual Firebase
// project config from:
//   Firebase Console → Project Settings → General → Your apps
// ─────────────────────────────────────────────────────────────
import { initializeApp }  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth }        from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey:            "AIzaSyDhKbU8UVFIF4eYFtAS6FV21cGRRzJtyEQ",
  authDomain:       "st-meridian-erp-718d6.firebaseapp.com",
  projectId:          "st-meridian-erp-718d6",
  storageBucket:     "st-meridian-erp-718d6.firebasestorage.app",
  messagingSenderId: "735845594175",
  appId:            "1:735845594175:web:02a4608e6a1f62445f748a"
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ─────────────────────────────────────────────────────────────
// NOTE: We no longer import getFirestore here.
// All data now comes from the Node.js backend API (api.js).
// ─────────────────────────────────────────────────────────────
