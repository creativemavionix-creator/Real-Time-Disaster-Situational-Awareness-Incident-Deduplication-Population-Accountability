// PRATYAKSH-Ω — Firebase Client Initialization
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyDoVfYaFEY9ZJOoP1hmDAEd9T3Cfvboqgo",
  authDomain: "project-e97d3.firebaseapp.com",
  projectId: "project-e97d3",
  storageBucket: "project-e97d3.firebasestorage.app",
  messagingSenderId: "966213047166",
  appId: "1:966213047166:web:898711dd786c748e57992f",
  measurementId: "G-W3X9CY57LH",
};

// Prevent duplicate initialization in Next.js development / Fast Refresh
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export default app;
