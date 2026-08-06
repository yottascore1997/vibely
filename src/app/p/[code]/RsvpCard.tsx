"use client";

import { useEffect, useState } from "react";
import InviteHeroVideo from "./InviteHeroVideo";

interface Props {
  inviteCode: string;
  senderName: string;
  initialStatus: string;
  initialInviteeName?: string;
  activityEmoji?: string;
  activityName?: string;
  timeLabel?: string;
  onAccepted?: () => void;
  /** Parent already shows rec/acc hero video */
  hideHeroVideo?: boolean;
}

export default function RsvpCard({
  inviteCode,
  senderName,
  initialStatus,
  initialInviteeName,
  activityEmoji,
  activityName,
  timeLabel,
  onAccepted,
  hideHeroVideo,
}: Props) {
  const [name, setName] = useState(initialInviteeName || "");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(
    initialStatus !== "pending" ? initialStatus : null
  );
  const [addedToPlan, setAddedToPlan] = useState<boolean | null>(null);
  const [syncNote, setSyncNote] = useState("");

  const submitRsvp = async (
    status: "accepted" | "rejected",
    opts?: { silent?: boolean; nameOverride?: string; phoneOverride?: string }
  ) => {
    if (!opts?.silent) {
      setErrorMessage("");
      setSubmitting(true);
    }

    const finalName = (opts?.nameOverride ?? name).trim() || "Guest";
    const finalPhone = (opts?.phoneOverride ?? phone).trim();

    try {
      const res = await fetch("/api/invites/public-rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode,
          name: finalName,
          phone: finalPhone,
          status,
        }),
      });
      const data = await res.json();
      const payload = data?.data ?? data;

      if (res.ok && data.success) {
        if (!name.trim()) setName(finalName);
        setRsvpStatus(status);
        if (status === "accepted") {
          onAccepted?.();
          setAddedToPlan(Boolean(payload?.addedToPlan));
          if (payload?.addedToPlan) {
            setSyncNote(
              payload?.alreadyMember
                ? "You're already on the host's plan."
                : "You've been added to the host's hangout."
            );
          } else {
            setSyncNote(
              payload?.failReason ||
                "Host needs to share invite from Create Plan so you're linked to the hangout."
            );
          }
        }
        return true;
      }

      if (!opts?.silent) {
        setErrorMessage(data.error || "Failed to submit RSVP");
      }
      return false;
    } catch {
      if (!opts?.silent) {
        setErrorMessage("Network error: Failed to connect to server");
      }
      return false;
    } finally {
      if (!opts?.silent) setSubmitting(false);
    }
  };

  useEffect(() => {
    if (initialStatus === "accepted") {
      submitRsvp("accepted", {
        silent: true,
        nameOverride: initialInviteeName || "Guest",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteCode, initialStatus]);

  const handleRSVP = (status: "accepted" | "rejected") => {
    void submitRsvp(status);
  };

  if (rsvpStatus) {
    const displayName = name.trim() || initialInviteeName || "friend";
    return (
      <div className="text-center space-y-4 animate-fade-in">
        {rsvpStatus === "accepted" ? (
          <>
            {!hideHeroVideo ? <InviteHeroVideo mode="acc" /> : null}
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
              <h4 className="text-lg font-bold text-emerald-400">RSVP Confirmed!</h4>
              <p className="text-sm text-gray-300">
                Awesome {displayName}! {senderName} has been notified that you are coming.
              </p>
              {syncNote ? (
                <p
                  className={`text-xs font-semibold ${
                    addedToPlan ? "text-emerald-300" : "text-amber-300"
                  }`}
                >
                  {syncNote}
                </p>
              ) : null}
              {addedToPlan === false ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleRSVP("accepted")}
                  className="mt-2 px-4 py-2 rounded-xl bg-white/10 text-sm font-bold text-white border border-white/15"
                >
                  {submitting ? "Syncing…" : "Retry add to plan"}
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2">
            <div className="text-4xl">😌</div>
            <h4 className="text-lg font-bold text-rose-400">Response Sent</h4>
            <p className="text-sm text-gray-300">
              No worries! We let {senderName} know you can&apos;t make it this time.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider text-center">
        Will you join {senderName}?
      </h4>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">
            Your Name <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Rahul (or leave blank as Guest)"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            className="w-full px-4 py-3 bg-[#0D0D14] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#8A56FF] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">
            Phone Number{" "}
            <span className="text-amber-400/90 font-normal">(needed for bill WhatsApp)</span>
          </label>
          <input
            type="tel"
            placeholder="10-digit WhatsApp number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 bg-[#0D0D14] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#8A56FF] transition"
          />
        </div>
      </div>

      {errorMessage && (
        <p className="text-xs font-semibold text-rose-400 text-center animate-bounce">
          {errorMessage}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          disabled={submitting}
          onClick={() => handleRSVP("rejected")}
          className="py-3.5 px-4 bg-white/5 border border-white/10 rounded-xl font-bold text-gray-300 hover:bg-white/10 active:scale-95 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {submitting ? "Submitting..." : "Can't Make It 😢"}
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={() => handleRSVP("accepted")}
          className="py-3.5 px-4 bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-xl font-black text-white shadow-lg hover:brightness-110 active:scale-95 transition text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {submitting ? "Submitting..." : "I'm Coming! 🎉"}
        </button>
      </div>
    </div>
  );
}
