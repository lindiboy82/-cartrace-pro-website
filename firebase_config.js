// firebase-config.js - FIXED VERSION
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getDatabase, ref, set, get, push, remove, update, onValue, off } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8iFriCB3kt4lWeXQUNj5LTsAXFZoXX0Y",
  authDomain: "cartrace-pro.firebaseapp.com",
  databaseURL: "https://cartrace-pro-default-rtdb.firebaseio.com/",
  projectId: "cartrace-pro",
  storageBucket: "cartrace-pro.firebasestorage.app",
  messagingSenderId: "341907523496",
  appId: "1:341907523496:web:f10a87930d939cf3b8ff9d",
  measurementId: "G-X01QW112CD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const database = getDatabase(app);

// Auth state observer
export function checkAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}

export default app;