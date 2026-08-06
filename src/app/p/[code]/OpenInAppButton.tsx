"use client";

import { useEffect, useState } from "react";

type Props = {
  inviteCode: string;
  activityEmoji?: string;
  activityName?: string;
};

/**
 * WhatsApp can only reliably open https links.
 * This page is that https landing — then we hand off into the Hangora app.
 */
export default function OpenInAppButton({
  inviteCode,
  activityEmoji,
  activityName,
}: Props) {
  const [tried, setTried] = useState(false);
  const appUrl = `vibematch://p/${inviteCode}`;
  const hangoraUrl = `hangora://p/${inviteCode}`;
  const webUrl = `https://www.hangora.app/p/${inviteCode}`;

  const openApp = () => {
    setTried(true);
    // Try custom schemes (installed app / Expo Go)
    const start = Date.now();
    window.location.href = appUrl;
    setTimeout(() => {
      // Fallback alternate scheme
      if (Date.now() - start < 2500) {
        window.location.href = hangoraUrl;
      }
    }, 600);
  };

  // Soft auto-prompt on mobile browsers
  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const mobile = /Android|iPhone|iPad|iPod/i.test(ua);
    if (!mobile) return;
    const t = setTimeout(() => {
      // Hidden iframe attempt (some Android browsers)
      try {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = appUrl;
        document.body.appendChild(iframe);
        setTimeout(() => iframe.remove(), 1500);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [appUrl]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={openApp}
        className="w-full py-4 rounded-2xl font-black text-white text-sm shadow-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] active:scale-[0.98] transition"
      >
        {activityEmoji ? `${activityEmoji} ` : ""}Open in Hangora App
      </button>
      <p className="text-[11px] text-center text-gray-400 leading-relaxed">
        {activityName
          ? `Join “${activityName}” inside the app for chat, map & hang details.`
          : "Best experience — join, chat & see the hang inside the app."}
        {tried ? (
          <>
            {" "}
            App not opening?{" "}
            <a href={webUrl} className="text-purple-300 underline">
              Stay on this page
            </a>{" "}
            and RSVP below.
          </>
        ) : (
          " No app? RSVP on this page below."
        )}
      </p>
    </div>
  );
}
