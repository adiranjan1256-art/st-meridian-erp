import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { loadStudentData } from "./script.js";

let isLogin = true;

const form = document.getElementById("authForm");
const toggle = document.getElementById("authToggle");
const title = document.getElementById("authTitle");
const btn = document.getElementById("authBtn");
const errorText = document.getElementById("authError");
const modal = document.getElementById("authModal");
const backdrop = document.getElementById("authBackdrop");
const closeBtn = document.getElementById("authCloseBtn");
const accountBtn = document.getElementById("accountBtn");
const accountBtnText = document.getElementById("accountBtnText");

function openAuthModal() {
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  document.getElementById("authEmail")?.focus();
}

function closeAuthModal() {
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.style.overflow = "";
  errorText.textContent = "";
  form?.reset();
}

function setAuthMode(loginMode) {
  isLogin = loginMode;
  title.textContent = isLogin ? "Sign in" : "Create account";
  btn.textContent = isLogin ? "Sign in" : "Create account";
  toggle.textContent = isLogin ? "Create one" : "Sign in";
  document.getElementById("authToggleText").firstChild.textContent = isLogin ? "Don’t have an account? " : "Already have an account? ";
  errorText.textContent = "";
}

accountBtn?.addEventListener("click", openAuthModal);
backdrop?.addEventListener("click", closeAuthModal);
closeBtn?.addEventListener("click", closeAuthModal);

toggle?.addEventListener("click", () => {
  setAuthMode(!isLogin);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("authEmail").value;
  const password = document.getElementById("authPassword").value;

  errorText.textContent = "";

  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
    closeAuthModal();
  } catch (error) {
    errorText.textContent = error.message;
  }
});
onAuthStateChanged(auth, (user) => {
  if (accountBtnText) accountBtnText.textContent = user ? "Account" : "Sign in";
  if (!user) setAuthMode(true);
  if (user) loadStudentData(); // ← load student data after login
});

// Keep header button text in sync with auth state.
onAuthStateChanged(auth, (user) => {
  if (accountBtnText) accountBtnText.textContent = user ? "Account" : "Sign in";
  // If user signs out in another tab, close modal.
  if (!user) setAuthMode(true);
});
