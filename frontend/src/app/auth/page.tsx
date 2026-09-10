"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  UserCheck,
  ChevronLeft,
  Terminal,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { TacticalAudio } from "@/lib/TacticalAudio";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/situation";

  const { signIn, signUp, signInAsDemo, user } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, show quick proceed option
  if (user) {
    return (
      <div
        className="min-h-[85vh] flex items-center justify-center p-6"
        style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-primary)" }}
      >
        <div
          className="w-full max-w-md p-8 rounded-2xl border text-center space-y-6"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-default)",
          }}
        >
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display-calm text-white">
              Authenticated Session Active
            </h2>
            <p className="text-sm font-mono-data text-[#9AAABE]">
              Signed in as <span className="text-white font-semibold">{user.email}</span>
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                TacticalAudio.playClick();
                if (typeof window !== "undefined") {
                  window.location.href = redirectUrl;
                }
              }}
              className="w-full btn-action-primary py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Operational Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setErrorMsg("Password confirmation does not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters in length.");
      return;
    }

    setIsSubmitting(true);
    TacticalAudio.playClick();

    try {
      if (mode === "signin") {
        await signIn(email, password);
        TacticalAudio.playPing();
        if (typeof window !== "undefined") {
          window.location.href = redirectUrl;
        }
      } else {
        await signUp(email, password);
        TacticalAudio.playPing();
        setSuccessMsg("Account clearance granted. Entering command terminal...");
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = redirectUrl;
          }
        }, 800);
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      let message = "Authentication failed. Please verify credentials.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        message = "Invalid email or password. Please verify and retry.";
      } else if (err.code === "auth/email-already-in-use") {
        message = "An operator account with this email already exists. Switch to Sign In.";
      } else if (err.code === "auth/user-not-found") {
        message = "No account found with this email. Please register clearance first.";
      } else if (err.code === "auth/weak-password") {
        message = "Security policy requires a stronger password (minimum 6 characters).";
      } else if (err.code === "auth/invalid-email") {
        message = "Invalid email address format.";
      } else if (err.message) {
        message = err.message;
      }
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = () => {
    TacticalAudio.playPing();
    signInAsDemo("Senior Operational Evaluator");
    if (typeof window !== "undefined") {
      window.location.href = redirectUrl;
    }
  };

  return (
    <div
      className="min-h-[90vh] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-primary)" }}
    >
      {/* Ambient background tactical glow */}
      <div
        aria-hidden
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[500px] pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(232,16,58,0.2) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      {/* Top backlink */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono-data text-xs text-[#9AAABE] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to System Dossier</span>
        </Link>
        <span className="font-mono-data text-[11px] text-[#5C6E84] tracking-wider uppercase">
          CLEARANCE: TACTICAL-O
        </span>
      </div>

      {/* Auth Card Container */}
      <div
        className="w-full max-w-md rounded-2xl border p-6 sm:p-8 space-y-6 relative z-10 shadow-2xl backdrop-blur-md"
        style={{
          backgroundColor: "rgba(17, 24, 39, 0.85)",
          borderColor: "var(--border-default)",
        }}
      >
        {/* Terminal Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-white/10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-mono-data font-bold text-white shadow-inner"
            style={{
              background: "linear-gradient(135deg, var(--bg-raised) 0%, var(--bg-surface) 100%)",
              border: "1px solid var(--border-default)",
            }}
          >
            Ω
          </div>
          <div>
            <h1 className="font-display-calm font-bold text-lg text-white leading-tight">
              PRATYAKSH-Ω Access Portal
            </h1>
            <p className="font-mono-data text-xs text-[#5C6E84] tracking-wide">
              Firebase Secure Command Authentication
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div
          className="grid grid-cols-2 p-1 rounded-xl font-mono-data text-xs"
          style={{ backgroundColor: "var(--bg-void)", border: "1px solid var(--border-subtle)" }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
              mode === "signin"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                : "text-[#9AAABE] hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                : "text-[#9AAABE] hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error / Feedback banners */}
        {errorMsg && (
          <div
            className="flex items-start gap-2.5 p-3 rounded-xl border text-xs font-mono-data animate-in fade-in"
            style={{
              backgroundColor: "rgba(232, 16, 58, 0.1)",
              borderColor: "var(--status-critical-border)",
              color: "var(--status-critical-text)",
            }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            className="flex items-start gap-2.5 p-3 rounded-xl border text-xs font-mono-data animate-in fade-in"
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              borderColor: "rgba(16, 185, 129, 0.3)",
              color: "#34D399",
            }}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block font-mono-data text-xs text-[#9AAABE] uppercase tracking-wider">
              Operator Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5C6E84]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@disaster-command.gov.np"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-mono-data transition-all focus:outline-none focus:ring-1 focus:ring-rose-500/50"
                style={{
                  backgroundColor: "var(--bg-void)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--fg-primary)",
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono-data text-xs text-[#9AAABE] uppercase tracking-wider">
              Security Key / Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5C6E84]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-mono-data transition-all focus:outline-none focus:ring-1 focus:ring-rose-500/50"
                style={{
                  backgroundColor: "var(--bg-void)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--fg-primary)",
                }}
              />
            </div>
          </div>

          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="block font-mono-data text-xs text-[#9AAABE] uppercase tracking-wider">
                Confirm Security Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5C6E84]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-mono-data transition-all focus:outline-none focus:ring-1 focus:ring-rose-500/50"
                  style={{
                    backgroundColor: "var(--bg-void)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--fg-primary)",
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-action-primary py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <span className="font-mono-data text-xs animate-pulse">Authenticating with Firebase...</span>
            ) : mode === "signin" ? (
              <>
                <span>Authorize & Enter Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Register Clearance</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-white/10" />
          <span className="flex-shrink mx-3 font-mono-data text-[11px] text-[#5C6E84] uppercase">
            OR EVALUATOR ACCESS
          </span>
          <div className="flex-grow border-t border-white/10" />
        </div>

        {/* Demo 1-Click Access for Evaluators */}
        <div>
          <button
            type="button"
            onClick={handleDemoAccess}
            className="w-full btn-action-secondary py-2.5 px-4 rounded-xl text-xs font-mono-data flex items-center justify-center gap-2 cursor-pointer hover:border-white/30 transition-all text-[#38BDF8]"
          >
            <Terminal className="w-4 h-4" />
            <span>Instant Demo Analyst Access (Bypass)</span>
          </button>
          <p className="text-[11px] font-mono-data text-center text-[#5C6E84] mt-2">
            Permits immediate testing of Situation, Intelligence, Response & Sitrep.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-[85vh] flex items-center justify-center font-mono-data text-xs"
          style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-tertiary)" }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Loading PRATYAKSH-Ω Access Terminal...</span>
          </div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
