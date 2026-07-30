"use client";

import { useState } from "react";
import SiteLayout from "@/components/site/SiteLayout";
import PageHero from "@/components/site/PageHero";
import { Trash2, ShieldAlert, CheckCircle2, AlertTriangle, KeyRound, Mail, Lock, Phone } from "lucide-react";

export default function DeleteAccountPage() {
  const [activeTab, setActiveTab] = useState<"instant" | "request">("instant");

  // Instant deletion state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [instantLoading, setInstantLoading] = useState(false);
  const [instantError, setInstantError] = useState("");
  const [instantSuccess, setInstantSuccess] = useState("");

  // Request deletion state
  const [reqEmail, setReqEmail] = useState("");
  const [reqPhone, setReqPhone] = useState("");
  const [reqReason, setReqReason] = useState("");
  const [reqLoading, setReqLoading] = useState(false);
  const [reqError, setReqError] = useState("");
  const [reqSuccess, setReqSuccess] = useState("");

  const handleInstantDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setInstantError("");
    setInstantSuccess("");

    if (!loginEmail || !loginPassword) {
      setInstantError("Please enter both email and password.");
      return;
    }

    if (!confirm("Are you sure you want to permanently delete your Hangora account and all personal data? This action cannot be undone.")) {
      return;
    }

    setInstantLoading(true);
    try {
      // 1. Authenticate user to obtain token
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const loginData = await loginRes.json();

      if (!loginRes.ok || loginData.success === false) {
        throw new Error(loginData.error || "Invalid email or password.");
      }

      const token = loginData.data?.token || loginData.token;

      // 2. Perform delete account
      const deleteRes = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const deleteData = await deleteRes.json();

      if (!deleteRes.ok || deleteData.success === false) {
        throw new Error(deleteData.error || "Failed to delete account.");
      }

      setInstantSuccess("Your account and all associated data have been permanently deleted.");
      setLoginEmail("");
      setLoginPassword("");
    } catch (err: any) {
      setInstantError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setInstantLoading(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReqError("");
    setReqSuccess("");

    if (!reqEmail && !reqPhone) {
      setReqError("Please enter either your registered Email address or Phone number.");
      return;
    }

    setReqLoading(true);
    try {
      const res = await fetch("/api/auth/delete-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: reqEmail, phone: reqPhone, reason: reqReason }),
      });
      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to submit request.");
      }

      setReqSuccess(data.data?.message || "Data deletion request submitted successfully!");
      setReqEmail("");
      setReqPhone("");
      setReqReason("");
    } catch (err: any) {
      setReqError(err.message || "Something went wrong. Please try again.");
    } finally {
      setReqLoading(false);
    }
  };

  return (
    <SiteLayout>
      <PageHero
        kicker="Account & Data Deletion"
        title="Delete Your Account & Data"
        subtitle="Manage your privacy choices. You can delete your profile directly or submit a data deletion request in accordance with Google Play Developer Policies."
      />

      <section className="site-wrap grid gap-8 pb-20 lg:grid-cols-[1fr_420px]">
        {/* Left Column: Disclosure Policy */}
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">What data gets deleted?</h2>
                <p className="text-sm text-vibe-muted">Google Play Policy Compliant Purge</p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-vibe-muted">
              When you initiate an account deletion request on Hangora, all personal information tied to your account is permanently purged from our database. This includes:
            </p>

            <ul className="mt-4 space-y-3 text-sm text-vibe-muted">
              {[
                "Account credentials (Name, Email, Phone number, Password hash)",
                "Profile attributes (Bio, Age, Gender preferences, Interests, Location)",
                "All uploaded Profile Photos & Media",
                "Swipes, Vibes, Matches & Private Chat Messages",
                "Created & Joined Hangouts, Events, and Group Messages",
                "Invites, Social Status badges, and Jar items",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Retention & Processing Time</h2>
                <p className="text-sm text-vibe-muted">Immediate vs. Request processing</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-vibe-muted">
              <p>
                • <strong className="text-white">Direct Online Deletion:</strong> Executes instantly upon credential verification. All profile data is removed immediately.
              </p>
              <p>
                • <strong className="text-white">Manual Deletion Requests:</strong> Processed within 24 to 48 hours after verification of ownership.
              </p>
              <p>
                • <strong className="text-white">Legal & Security Exception:</strong> Security log entries or fraud prevention records strictly mandated by local laws may be retained in anonymized format for up to 30 days before total purging.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Deletion Forms */}
        <div className="rounded-[2.5rem] border border-white/12 bg-[#0A0A10] p-6 sm:p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("instant")}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                activeTab === "instant"
                  ? "bg-vibe-pink text-white shadow-md"
                  : "text-vibe-muted hover:text-white"
              }`}
            >
              Instant Delete (Login)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("request")}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                activeTab === "request"
                  ? "bg-vibe-pink text-white shadow-md"
                  : "text-vibe-muted hover:text-white"
              }`}
            >
              Submit Request
            </button>
          </div>

          {activeTab === "instant" ? (
            <form onSubmit={handleInstantDelete} className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Instant Account Deletion</h3>
                <p className="mt-1 text-xs text-vibe-muted">
                  Log in with your account credentials to permanently wipe your profile right now.
                </p>
              </div>

              {instantError ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{instantError}</span>
                </div>
              ) : null}

              {instantSuccess ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{instantSuccess}</span>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-vibe-muted" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-white/12 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-vibe-muted focus:border-vibe-pink focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-vibe-muted" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/12 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-vibe-muted focus:border-vibe-pink focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={instantLoading}
                className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 transition"
              >
                {instantLoading ? "Deleting Account..." : "Permanently Delete My Account"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRequestSubmit} className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Submit Deletion Request</h3>
                <p className="mt-1 text-xs text-vibe-muted">
                  Use this if you forgot your password or no longer have the mobile app installed.
                </p>
              </div>

              {reqError ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{reqError}</span>
                </div>
              ) : null}

              {reqSuccess ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{reqSuccess}</span>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Registered Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-vibe-muted" />
                  <input
                    type="email"
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/12 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-vibe-muted focus:border-vibe-pink focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-vibe-muted" />
                  <input
                    type="tel"
                    value={reqPhone}
                    onChange={(e) => setReqPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full rounded-xl border border-white/12 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-vibe-muted focus:border-vibe-pink focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Reason / Additional details</label>
                <textarea
                  rows={2}
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="Optional details..."
                  className="w-full rounded-xl border border-white/12 bg-white/5 p-3 text-sm text-white placeholder:text-vibe-muted focus:border-vibe-pink focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={reqLoading}
                className="w-full rounded-xl bg-vibe-pink py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition"
              >
                {reqLoading ? "Submitting Request..." : "Submit Deletion Request"}
              </button>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
