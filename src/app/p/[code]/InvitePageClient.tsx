"use client";

import { useState } from "react";
import InviteHeroVideo from "./InviteHeroVideo";
import OpenInAppButton from "./OpenInAppButton";
import RsvpCard from "./RsvpCard";

type Props = {
  inviteCode: string;
  senderName: string;
  senderAvatar: string;
  senderCity: string;
  activityEmoji: string;
  activityName: string;
  timeLabel: string;
  initialStatus: string;
  initialInviteeName?: string;
};

/**
 * Owns invite → accept video swap on the web landing page.
 */
export default function InvitePageClient({
  inviteCode,
  senderName,
  senderAvatar,
  senderCity,
  activityEmoji,
  activityName,
  timeLabel,
  initialStatus,
  initialInviteeName,
}: Props) {
  const [accepted, setAccepted] = useState(
    initialStatus === "accepted"
  );

  return (
    <div className="bg-[#161622]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
      <InviteHeroVideo mode={accepted ? "acc" : "rec"} />

      <div className="flex items-center gap-4 border-b border-white/10 pb-5">
        <div className="relative">
          <img
            src={senderAvatar}
            alt={senderName}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#8A56FF] shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 bg-[#22C55E] text-black text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow">
            Host
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            You are invited by
          </p>
          <h2 className="text-2xl font-black text-white">{senderName}</h2>
          <p className="text-xs text-purple-300 font-medium">📍 {senderCity}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#8A56FF]/15 to-[#FF4B81]/15 border border-[#8A56FF]/30 rounded-2xl p-4 text-center relative">
        <div className="text-4xl mb-1">{activityEmoji}</div>
        <h3 className="text-lg font-extrabold text-white capitalize tracking-wide">
          {activityName} Hangout
        </h3>
        <p className="text-sm font-semibold text-purple-200 mt-1">
          ⏰ {timeLabel || "Soon"}
        </p>
      </div>

      {!accepted ? (
        <>
          <OpenInAppButton
            inviteCode={inviteCode}
            activityEmoji={activityEmoji}
            activityName={activityName}
          />
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              or RSVP here
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        </>
      ) : null}

      <RsvpCard
        inviteCode={inviteCode}
        senderName={senderName}
        initialStatus={initialStatus}
        initialInviteeName={initialInviteeName}
        activityEmoji={activityEmoji}
        activityName={activityName}
        timeLabel={timeLabel}
        onAccepted={() => setAccepted(true)}
        hideHeroVideo
      />
    </div>
  );
}
